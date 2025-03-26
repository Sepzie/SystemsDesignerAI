import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

export default function HomePage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Design Complex Systems with AI Assistance
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Create system diagrams, API specifications, data models, and more with AI-powered assistance.
            Collaborate with AI to design the architecture for your next project.
          </p>
          <Link
            href="/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">System Diagrams</h2>
            <p className="text-gray-600">
              Generate comprehensive system architecture diagrams showing components, interactions, and data flows.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">API Specifications</h2>
            <p className="text-gray-600">
              Create detailed API specifications including endpoints, request/response formats, and authentication methods.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Data Models</h2>
            <p className="text-gray-600">
              Design database schemas and data models with entity relationships, fields, and constraints.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
