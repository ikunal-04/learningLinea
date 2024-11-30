import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import StudentDashboard from '@/components/StudentDashboard'
import AdminDashboard from '@/components/AdminDashboard'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/consts'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  const [account, setAccount] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const ethereum = window.ethereum as unknown as ethers.Eip1193Provider;
          await window.ethereum?.request?.({ method: 'eth_requestAccounts' })
          const provider = new ethers.BrowserProvider(ethereum)
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setAccount(address)

          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
          setContract(contract)

          const owner = await contract.owner()
          setIsOwner(address.toLowerCase() === owner.toLowerCase())
        } catch (error) {
          console.error("An error occurred:", error)
        }
      }
    }

    init()
  }, [])

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Welcome to Adaptive Learning</CardTitle>
            <CardDescription>Please connect your wallet to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.ethereum?.request?.({ method: 'eth_requestAccounts' })}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Adaptive Learning Platform</h1>
      {isOwner ? <AdminDashboard contract={contract} /> : <StudentDashboard contract={contract} account={account} />}
      <Toaster />
    </div>
  )
}

