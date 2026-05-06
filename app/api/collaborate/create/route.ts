import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/auth/user'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { projectName, description, skillsNeeded, duration, commitment, maxPositions } = await req.json()

        if (!projectName?.trim() || !description?.trim()) {
            return NextResponse.json({ error: 'Project name and description are required' }, { status: 400 })
        }

        const normalizedMaxPositions =
            typeof maxPositions === 'number' && Number.isFinite(maxPositions) && maxPositions > 0
                ? maxPositions
                : undefined

        // 1. Ensure the current Clerk user is linked to a Sanity user
        const sanityUser = await getOrCreateUser()
        const sanityUserId = sanityUser?._id

        if (!sanityUserId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Create Collaboration Document
        const result = await client.create({
            _type: 'collaboration',
            projectName: projectName.trim(),
            description: description.trim(),
            skillsNeeded: skillsNeeded ? skillsNeeded.split(',').map((s: string) => s.trim()) : [],
            duration: duration?.trim() || undefined,
            commitment: commitment?.trim() || undefined,
            maxPositions: normalizedMaxPositions,
            status: 'open',
            postedBy: {
                _type: 'reference',
                _ref: sanityUserId,
            },
            applicants: [],
            _createdAt: new Date().toISOString(),
        })

        return NextResponse.json({ success: true, id: result._id })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}
