// Test data for debugging project navigation issues
export const testProjects = [
  {
    id: 1,
    title: "Test Project 1",
    category: "Residential",
    year: "2024",
    location: "Thimphu",
    status: "Completed",
    client: "Test Client 1",
    description: "This is a test project for debugging navigation issues.",
    image: "/images/project1.png",
    images: ["/images/project1.png"],
    featured: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    title: "Test Project 2",
    category: "Commercial Buildings",
    year: "2024",
    location: "Paro",
    status: "In Progress",
    client: "Test Client 2",
    description: "This is another test project for debugging navigation issues.",
    image: "/images/project2.png",
    images: ["/images/project2.png"],
    featured: true,
    createdAt: "2024-01-02T00:00:00.000Z"
  },
  {
    id: 3,
    title: "Test Project 3",
    category: "Private Homes",
    year: "2023",
    location: "Punakha",
    status: "Completed",
    client: "Test Client 3",
    description: "This is a third test project for debugging navigation issues.",
    image: "/images/project3.png",
    images: ["/images/project3.png"],
    featured: false,
    createdAt: "2024-01-03T00:00:00.000Z"
  }
]

export const testFeaturedProjects = testProjects.filter(p => p.featured)