import { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface AdminDashboardProps {
  contract: ethers.Contract | null
}

export default function AdminDashboard({ contract }: AdminDashboardProps) {
  const [courseName, setCourseName] = useState('')
  const [descriptionURI, setDescriptionURI] = useState('')
  const [totalMilestones, setTotalMilestones] = useState('')
  const [rewardPerMilestone, setRewardPerMilestone] = useState('')
  const [fundAmount, setFundAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const { toast } = useToast()

  const addCourse = async () => {
    if (contract) {
      try {
        const tx = await contract.addCourse(
          courseName,
          descriptionURI,
          totalMilestones,
          ethers.parseEther(rewardPerMilestone)
        )
        await tx.wait()
        toast({
            title: "Course Added",
            description: "Course has been added successfully!",
        })
        setCourseName('')
        setDescriptionURI('')
        setTotalMilestones('')
        setRewardPerMilestone('')
      } catch (error) {
        console.error("Error adding course:", error)
      }
    }
  }

  const fundContract = async () => {
    if (contract) {
      try {
        const tx = await contract.fundContract({ value: ethers.parseEther(fundAmount) })
        await tx.wait()
        toast({
            title: "Contract Funded",
            description: "Contract has been funded successfully!",
        })
        setFundAmount('')
      } catch (error) {
        console.error("Error funding contract:", error)
      }
    }
  }

  const withdrawFunds = async () =>{
    if (contract) {
      try {
        const tx = await contract.withdrawFunds(ethers.parseEther(withdrawAmount))
        await tx.wait()
        toast({
            title: "Funds Withdrawn",
            description: "Funds have been withdrawn successfully!",
        })
        setWithdrawAmount('')
      } catch (error) {
        console.error("Error withdrawing funds:", error)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
          <CardDescription>Create a new course for students to enroll in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <Input
            placeholder="Description URI"
            value={descriptionURI}
            onChange={(e) => setDescriptionURI(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Total Milestones"
            value={totalMilestones}
            onChange={(e) => setTotalMilestones(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Reward per Milestone (ETH)"
            value={rewardPerMilestone}
            onChange={(e) => setRewardPerMilestone(e.target.value)}
          />
          <Button onClick={addCourse}>Add Course</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fund Contract</CardTitle>
          <CardDescription>Add funds to the contract for student rewards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="Amount to Fund (ETH)"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
          />
          <Button onClick={fundContract}>Fund Contract</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>Withdraw funds from the contract.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="Amount to Withdraw (ETH)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <Button onClick={withdrawFunds}>Withdraw Funds</Button>
        </CardContent>
      </Card>
    </div>
  )
}

