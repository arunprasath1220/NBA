import { create } from "zustand";
import { persist } from "zustand/middleware";

const currentYear = new Date().getFullYear();

const defaultAcademicYears = [
  `${currentYear - 1}-${String(currentYear).slice(-2)}`,
  `${currentYear}-${String(currentYear + 1).slice(-2)}`,
  `${currentYear + 1}-${String(currentYear + 2).slice(-2)}`,
  `${currentYear + 2}-${String(currentYear + 3).slice(-2)}`,
];

const useFilterStore = create(
  persist(
    (set) => ({
      academicYearOptions: defaultAcademicYears,
      selectedAcademicYear: "",
      selectedProgramId: "",
      selectedProgramLabel: "",
      programs: [],

      setSelectedAcademicYear: (year) => set({ selectedAcademicYear: year }),

      setPrograms: (programs) => set({ programs }),

      setSelectedProgram: (programId, programLabel = "") =>
        set({
          selectedProgramId: programId,
          selectedProgramLabel: programLabel,
        }),

      clearProgramSelection: () =>
        set({
          selectedProgramId: "",
          selectedProgramLabel: "",
        }),
    }),
    {
      name: "nba-global-filters",
      partialize: (state) => ({
        selectedAcademicYear: state.selectedAcademicYear,
        selectedProgramId: state.selectedProgramId,
        selectedProgramLabel: state.selectedProgramLabel,
      }),
    },
  ),
);

export default useFilterStore;
