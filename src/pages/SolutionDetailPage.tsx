import { Navigate, useParams } from 'react-router-dom'
import { PageTransition } from '../components/ui/PageTransition'
import { SolutionProgramDetail } from '../components/sections/SolutionProgramDetail'
import { getSolutionBySlug } from '../data/solutionsContent'

export function SolutionDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return <Navigate to="/solutions" replace />
  }

  if (slug === 'dfr') {
    return <Navigate to="/dfr" replace />
  }

  const vertical = getSolutionBySlug(slug)

  if (!vertical) {
    return <Navigate to="/solutions" replace />
  }

  return (
    <PageTransition>
      <SolutionProgramDetail vertical={vertical} />
    </PageTransition>
  )
}
