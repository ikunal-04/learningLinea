import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface Course {
  id: number
  name: string
  totalMilestones: number
  rewardPerMilestone: number
}

interface StudentDashboardProps {
  contract: ethers.Contract | null
  account: string
}

export default function StudentDashboard({ contract, account }: StudentDashboardProps) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [milestonesCompleted, setMilestonesCompleted] = useState<number>(0)

  const { toast } = useToast()

  useEffect(() => {
    const checkRegistration = async () => {
      if (contract) {
        const registered = await contract.registeredStudents(account)
        setIsRegistered(registered)
        if (registered) {
          fetchCourses()
        }
      }
    }

    checkRegistration()
  }, [contract, account])

  const registerStudent = async () => {
    if (contract) {
      try {
        const tx = await contract.registerStudent()
        await tx.wait()
        setIsRegistered(true)
        fetchCourses()
      } catch (error) {
        console.error("Error registering student:", error)
      }
    }
  }

  const fetchCourses = async () => {
    if (contract) {
      try {
        const courseCount = await contract.courseCounter()
        const fetchedCourses: Course[] = [] // Add type annotation for fetchedCourses array
        
        // console.log(coursess);
        for (let i = 1; i <= courseCount; i++) {
            const course = await contract.getCourseDetails(i)
            console.log(course);
            
            if (course.exists) {
                fetchedCourses.push({
                    id: i,
                    name: course.name,
                    totalMilestones: Number(course.totalMilestones), // Convert totalMilestones to number
                    rewardPerMilestone: Number(ethers.formatEther(course.rewardPerMilestone)) // Convert rewardPerMilestone to number
                })
            }
        }
        setCourses(fetchedCourses)
      } catch (error) {
        console.error("Error fetching courses:", error)
      }
    }
  }

  const updateProgress = async () => {
    if (contract && selectedCourse !== null) {
      try {
        const tx = await contract.updateProgress(selectedCourse, milestonesCompleted)
        await tx.wait()
        toast({
            title: "Progress updated successfully!",
            description: "You have successfully updated your progress.",
        })
      } catch (error) {
        console.error("Error updating progress:", error)
      }
    }
  }

  const claimReward = async () => {
    if (contract && selectedCourse !== null) {
      try {
        const tx = await contract.claimReward(selectedCourse)
        await tx.wait()
        toast({
            title: "Reward claimed successfully!",
            description: "You have successfully claimed your reward.",
        })
      } catch (error) {
        console.error("Error claiming reward:", error)
      }
    }
  }

  if (!isRegistered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>Register as a student to access courses and earn rewards.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={registerStudent}>Register as Student</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {courses.map((course) => (
              <li key={course.id} className="mb-2">
                <Button
                  variant={selectedCourse === course.id ? "default" : "outline"}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  {course.name} - {course.totalMilestones} milestones, {course.rewardPerMilestone} ETH per milestone
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {selectedCourse !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Update Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Milestones completed"
              value={milestonesCompleted}
              onChange={(e) => setMilestonesCompleted(parseInt(e.target.value))}
            />
            <Button onClick={updateProgress}>Update Progress</Button>
          </CardContent>
        </Card>
      )}

      {selectedCourse !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Claim Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={claimReward}>Claim Reward</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

