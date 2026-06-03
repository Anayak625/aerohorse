import { Navigate } from 'react-router-dom'
import { PageTransition } from '../components/ui/PageTransition'
import { SolutionProgramDetail } from '../components/sections/SolutionProgramDetail'
import { getSolutionBySlug } from '../data/solutionsContent'

export function DFRPage() {
  const vertical = getSolutionBySlug('dfr')

  if (!vertical) {
    return <Navigate to="/solutions" replace />
  }

  return (
    <PageTransition>
      <SolutionProgramDetail vertical={vertical} />
    </PageTransition>
  )
}
