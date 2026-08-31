/**
 * Database Connection Pool Configuration
 * 
 * This module provides optimized database connection pooling for the PetAdopt application.
 * It implements connection pooling best practices for performance and reliability.
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Connection Pool Configuration
 */
const poolConfig = {
  // Maximum number of concurrent connections
  maxConnections: 20,
  
  // Minimum number of connections to maintain
  minConnections: 5,
  
  // Connection idle timeout (30 seconds)
  idleTimeoutMs: 30000,
  
  // Connection acquire timeout (2 seconds) 
  acquireTimeoutMs: 2000,
  
  // Maximum connection lifetime (7500 uses)
  maxUses: 7500,
  
  // Health check interval (10 seconds)
  healthCheckIntervalMs: 10000
};

/**
 * Database Connection Pool Class
 */
class DatabasePool {
  constructor() {
    this.dbPath = join(__dirname, '../../prisma/dev.db');
    this.connections = new Map();
    this.availableConnections = [];
    this.usedConnections = new Set();
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      acquiredConnections: 0,
      totalQueries: 0,
      failedQueries: 0
    };
    
    // Initialize minimum connections
    this.initializePool();
    
    // Start health check
    this.startHealthCheck();
  }

  /**
   * Initialize the connection pool with minimum connections
   */
  initializePool() {
    for (let i = 0; i < poolConfig.minConnections; i++) {
      const connection = this.createConnection();
      this.availableConnections.push(connection);
    }
    
    console.log(`📊 Database pool initialized with ${poolConfig.minConnections} connections`);
  }

  /**
   * Create a new database connection
   */
  createConnection() {
    const connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      db: new Database(this.dbPath),
      createdAt: Date.now(),
      lastUsed: Date.now(),
      useCount: 0,
      isHealthy: true
    };
    
    this.connections.set(connection.id, connection);
    this.stats.totalConnections++;
    
    return connection;
  }

  /**
   * Acquire a connection from the pool
   */
  async acquireConnection() {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Connection acquire timeout'));
      }, poolConfig.acquireTimeoutMs);

      try {
        let connection = this.availableConnections.pop();
        
        // Create new connection if none available and under max limit
        if (!connection && this.stats.totalConnections < poolConfig.maxConnections) {
          connection = this.createConnection();
        }
        
        // Wait for connection to become available
        if (!connection) {
          // In a real implementation, this would use a queue
          setTimeout(() => {
            this.acquireConnection().then(resolve).catch(reject);
          }, 100);
          return;
        }
        
        clearTimeout(timeoutId);
        
        // Mark connection as used
        this.usedConnections.add(connection.id);
        connection.lastUsed = Date.now();
        connection.useCount++;
        this.stats.activeConnections++;
        this.stats.acquiredConnections++;
        
        resolve(connection);
        
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(connection) {
    if (!this.usedConnections.has(connection.id)) {
      console.warn(`⚠️  Attempting to release unknown connection ${connection.id}`);
      return;
    }
    
    this.usedConnections.delete(connection.id);
    this.stats.activeConnections--;
    
    // Check if connection should be retired
    if (connection.useCount >= poolConfig.maxUses || !connection.isHealthy) {
      this.retireConnection(connection);
    } else {
      this.availableConnections.push(connection);
    }
  }

  /**
   * Retire a connection (close and remove from pool)
   */
  retireConnection(connection) {
    try {
      connection.db.close();
      this.connections.delete(connection.id);
      this.stats.totalConnections--;
      
      // Ensure minimum connections
      if (this.availableConnections.length < poolConfig.minConnections) {
        const newConnection = this.createConnection();
        this.availableConnections.push(newConnection);
      }
      
    } catch (error) {
      console.error(`❌ Error retiring connection ${connection.id}:`, error);
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  async query(sql, params = []) {
    const startTime = Date.now();
    let connection = null;
    
    try {
      connection = await this.acquireConnection();
      const result = connection.db.prepare(sql).all(...params);
      
      this.stats.totalQueries++;
      
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        console.warn(`⏱️  Slow query detected (${duration}ms): ${sql.substring(0, 100)}...`);
      }
      
      return result;
      
    } catch (error) {
      this.stats.failedQueries++;
      console.error(`❌ Query failed:`, error);
      throw error;
      
    } finally {
      if (connection) {
        this.releaseConnection(connection);
      }
    }
  }

  /**
   * Start health check monitoring
   */
  startHealthCheck() {
    setInterval(() => {
      this.performHealthCheck();
    }, poolConfig.healthCheckIntervalMs);
  }

  /**
   * Perform health check on connections
   */
  performHealthCheck() {
    const now = Date.now();
    
    // Check idle connections
    this.availableConnections = this.availableConnections.filter(connection => {
      const idleTime = now - connection.lastUsed;
      
      if (idleTime > poolConfig.idleTimeoutMs) {
        // Test connection health
        try {
          connection.db.prepare('SELECT 1').get();
          connection.isHealthy = true;
          return true;
        } catch (error) {
          connection.isHealthy = false;
          this.retireConnection(connection);
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      ...this.stats,
      availableConnections: this.availableConnections.length,
      configuredMaxConnections: poolConfig.maxConnections,
      configuredMinConnections: poolConfig.minConnections
    };
  }

  /**
   * Gracefully close all connections
   */
  async close() {
    console.log('🔄 Closing database pool...');
    
    // Close all connections
    for (const connection of this.connections.values()) {
      try {
        connection.db.close();
      } catch (error) {
        console.error(`Error closing connection ${connection.id}:`, error);
      }
    }
    
    this.connections.clear();
    this.availableConnections.length = 0;
    this.usedConnections.clear();
    
    console.log('✅ Database pool closed successfully');
  }
}

// Create singleton instance
const pool = new DatabasePool();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  await pool.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.close();
  process.exit(0);
});

export default pool;