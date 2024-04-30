// import { ChevronDown } from 'lucide-react'
// import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

// const SORT_OPTIONS = [
//   {name: "none", value: "none"},
//   {name: "Price: Low to High", value: "price-asc"},
//   {name: "Price: High to Low", value: "price-desc"},
// ]  as const
// // as const will tell us that array is readonly and we can't modify it

// interface DropdownOptionsProps {
//   filter: {
//     sort: string
//   }
//   filterHandler: (filter: { sort: string }) => void

// }

// const DropdownOptions = ({ filter, filterHandler}) => {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger className='group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
//         Sort
//         <ChevronDown className='-mr-1 ml-1 w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500' />
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         { SORT_OPTIONS.map((option) => (
//           <button key={option.name} onClick={(prev) => {
//             filterHandler({
//               ...prev,
//               option.value,
//             })
//           }}></button>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }

// export default DropdownOptions
