import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Person {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface Company {
  id: string
  name: string
}

interface CrmState {
  // Selected entities
  selectedPerson: Person | null
  selectedCompany: Company | null
  
  // UI State
  isSidebarOpen: boolean
  
  // Actions
  setSelectedPerson: (person: Person | null) => void
  setSelectedCompany: (company: Company | null) => void
  toggleSidebar: () => void
}

export const useCrmStore = create<CrmState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedPerson: null,
      selectedCompany: null,
      isSidebarOpen: true,
      
      // Actions
      setSelectedPerson: (person) => set({ selectedPerson: person }),
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    { name: 'CRM Store' }
  )
)
