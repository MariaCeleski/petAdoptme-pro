'use client';

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total pets card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total de Pets</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalPets}
            </p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <svg 
              className="w-6 h-6 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 4v16m-7-7h14M3 12a9 9 0 1118 0 9 9 0 01-18 0z" 
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Pets cadastrados na plataforma
        </p>
      </div>

      {/* Adopted pets card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Adotados</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.adoptedCount}
            </p>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <svg 
              className="w-6 h-6 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Pets já adotados
        </p>
      </div>

      {/* Pending requests card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Pendentes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.pendingRequests}
            </p>
          </div>
          <div className="bg-yellow-100 rounded-full p-3">
            <svg 
              className="w-6 h-6 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Solicitações em análise
        </p>
      </div>

      {/* Success rate card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Taxa de Sucesso</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.successRate}%
            </p>
          </div>
          <div className="bg-purple-100 rounded-full p-3">
            <svg 
              className="w-6 h-6 text-purple-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Taxa de adoção dos seus pets
        </p>
      </div>
    </div>
  );
}
