interface LcarsHeaderProps {
  title: string
  stardate: string
  shipName: string
}

export function LcarsHeader({ title, stardate, shipName }: LcarsHeaderProps) {
  return (
    <header className="bg-black text-white p-4 border-t-4 border-l-4 border-r-4 border-[#f90] rounded-t-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-[#f90] rounded-tl-lg rounded-br-lg mr-4"></div>
          <h1 className="text-2xl font-bold text-[#f90]">{title}</h1>
        </div>
        <div className="flex space-x-6">
          <div className="text-right">
            <div className="text-sm text-gray-400">STARDATE</div>
            <div className="text-[#f90] font-mono">{stardate}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">VESSEL</div>
            <div className="text-[#f90] font-mono">{shipName}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
