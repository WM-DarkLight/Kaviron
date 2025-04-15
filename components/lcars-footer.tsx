export function LcarsFooter() {
  return (
    <footer className="bg-black text-white p-4 border-b-4 border-l-4 border-r-4 border-[#f90] rounded-b-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-16 h-8 bg-[#f90] rounded-bl-lg mr-4"></div>
          <div className="w-24 h-8 bg-[#f90] rounded-lg mr-4"></div>
          <div className="w-12 h-8 bg-[#f90] rounded-lg"></div>
        </div>
        <div className="flex space-x-4">
          <div className="w-20 h-8 bg-[#f90] rounded-lg"></div>
          <div className="w-16 h-8 bg-[#f90] rounded-br-lg"></div>
        </div>
      </div>
    </footer>
  )
}
