import { useParams } from "react-router-dom"
import SkillDetails from "@/components/components/SkillDetails"
import { mockSkillListings } from "../../../data/mockData"

export default function SkillDetailsPage() {
  const { id } = useParams()
  const skill = mockSkillListings.find((s) => s._id === id)

  if (!skill) {
    return <div>Skill not found</div>
  }

  return <SkillDetails skill={skill} />
}
