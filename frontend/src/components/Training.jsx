import React, { useState } from "react";
import { GraduationCap, BookOpen, Award, Users, Play, CheckCircle, Clock, Plus, X, AlertCircle } from "lucide-react";

// Mock data since imports aren't available
const mockTrainingModules = [
  { 
    id: 1,
    title: "Cybersecurity Fundamentals", 
    enrolled: 245,
    completed: 198,
    completionRate: 81,
    status: "active"
  },
  { 
    id: 2,
    title: "GDPR Compliance Training", 
    enrolled: 178,
    completed: 156,
    completionRate: 88,
    status: "active"
  },
  { 
    id: 3,
    title: "Phishing Awareness", 
    enrolled: 312,
    completed: 265,
    completionRate: 85,
    status: "active"
  },
  { 
    id: 4,
    title: "Incident Response Basics", 
    enrolled: 89,
    completed: 67,
    completionRate: 75,
    status: "draft"
  }
];

export function Training() {
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  const departmentCompletion = [
    { department: "IT Security", completion: 95 },
    { department: "Engineering", completion: 88 },
    { department: "Finance", completion: 82 },
    { department: "HR", completion: 91 },
    { department: "Operations", completion: 76 },
    { department: "Legal", completion: 98 }
  ];

  const certifications = [
    {
      name: "Security Awareness Certification",
      holders: 145,
      expiring: 12,
      icon: Award
    },
    {
      name: "Advanced Threat Detection",
      holders: 34,
      expiring: 3,
      icon: Award
    },
    {
      name: "Compliance Officer Certification",
      holders: 23,
      expiring: 5,
      icon: Award
    }
  ];

  const courses = [
    {
      id: 1,
      title: "Introduction to Cybersecurity",
      duration: "2 hours",
      enrolled: 234,
      completed: 198,
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Advanced Access Control",
      duration: "4 hours",
      enrolled: 89,
      completed: 67,
      difficulty: "Advanced"
    },
    {
      id: 3,
      title: "Incident Response Procedures",
      duration: "3 hours",
      enrolled: 145,
      completed: 112,
      difficulty: "Intermediate"
    },
    {
      id: 4,
      title: "Data Protection & GDPR",
      duration: "3.5 hours",
      enrolled: 178,
      completed: 156,
      difficulty: "Intermediate"
    }
  ];

  const handleCreateCourse = (e) => {
    e.preventDefault();
    setShowCreateCourse(false);
    // Handle course creation
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Active</div>;
    }
    return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Draft</div>;
  };

  const getDifficultyBadge = (difficulty) => {
    let colorClass = "";
    switch(difficulty.toLowerCase()) {
      case "beginner": colorClass = "bg-green-100 text-green-800"; break;
      case "intermediate": colorClass = "bg-yellow-100 text-yellow-800"; break;
      case "advanced": colorClass = "bg-red-100 text-red-800"; break;
      default: colorClass = "bg-gray-100 text-gray-800";
    }
    return <div className={`${colorClass} px-3 py-1 rounded-full text-xs`}>{difficulty}</div>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header with Requirements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Training & Awareness</h1>
            <p className="text-gray-600">Employee security training and certification management</p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center font-medium transition-colors"
            onClick={() => setShowCreateCourse(true)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Create Course
          </button>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>Training & Security Awareness:</strong> Comprehensive employee training management system 
                featuring course creation, enrollment tracking, completion monitoring, and certification management. 
                Implements mandatory security awareness training, phishing simulations, role-based training paths, 
                automated reminders, progress tracking dashboards, and compliance reporting. Supports multiple 
                training formats including e-learning modules, workshops, and certification programs with expiry 
                tracking and renewal notifications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Enrolled Users</p>
              <h3 className="text-2xl font-bold">2,456</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <h3 className="text-2xl font-bold">202</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <h3 className="text-2xl font-bold">87%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Department Completion */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Training Completion by Department</h2>
          <p className="text-gray-600">Overall training progress across all departments</p>
        </div>
        <div className="h-80">
          <div className="w-full h-full flex flex-col items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-center mb-4">
              <p className="text-gray-500 mb-2">Department Completion Chart</p>
            </div>
            <div className="space-y-3 w-full max-w-lg">
              {departmentCompletion.map((dept, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept.department}</span>
                    <span>{dept.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${dept.completion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Training Modules */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Active Training Modules</h2>
          <p className="text-gray-600">Current training programs and enrollment statistics</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockTrainingModules.map((module) => (
              <div key={module.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{module.title}</h4>
                      <p className="text-sm text-gray-500">
                        {module.enrolled} enrolled • {module.completed} completed
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(module.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className="font-medium">{module.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${module.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Courses */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Available Courses</h2>
            <p className="text-gray-600">Security training courses catalog</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">{course.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                        {getDifficultyBadge(course.difficulty)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">
                      {course.completed}/{course.enrolled} completed
                    </span>
                    <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center transition-colors">
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Active Certifications</h2>
            <p className="text-gray-600">Employee certification tracking</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {certifications.map((cert, index) => {
                const Icon = cert.icon;
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium mb-2">{cert.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Active Holders</p>
                            <p className="font-medium">{cert.holders}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Expiring Soon</p>
                            <p className="font-medium text-blue-600">{cert.expiring}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Training Sessions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Upcoming Training Sessions</h2>
          <p className="text-gray-600">Scheduled training events and workshops</p>
        </div>
        <div className="space-y-3">
          {[
            {
              title: "Security Best Practices Workshop",
              date: "January 10, 2026",
              time: "10:00 AM - 12:00 PM",
              instructor: "Ingabire Marie",
              seats: "25/30"
            },
            {
              title: "Phishing Awareness Training",
              date: "January 15, 2026",
              time: "2:00 PM - 3:30 PM",
              instructor: "Uwimana Jean Claude",
              seats: "40/50"
            },
            {
              title: "Advanced Threat Detection",
              date: "January 22, 2026",
              time: "9:00 AM - 1:00 PM",
              instructor: "Niyonzima Eric",
              seats: "15/20"
            }
          ].map((session, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{session.title}</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>{session.date} • {session.time}</p>
                    <p>Instructor: {session.instructor}</p>
                    <p>Available Seats: {session.seats}</p>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Create New Course</h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowCreateCourse(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">Add a new training course to the platform</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="courseTitle" className="block font-medium">Course Title</label>
                  <input
                    id="courseTitle"
                    placeholder="e.g., Advanced Cybersecurity Training"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="courseDescription" className="block font-medium">Description</label>
                  <textarea
                    id="courseDescription"
                    className="w-full min-h-[80px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Course overview and learning objectives..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="courseDuration" className="block font-medium">Duration</label>
                    <input
                      id="courseDuration"
                      placeholder="e.g., 3 hours"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="courseDifficulty" className="block font-medium">Difficulty</label>
                    <select
                      id="courseDifficulty"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="courseCategory" className="block font-medium">Category</label>
                  <select
                    id="courseCategory"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">Select category...</option>
                    <option value="Security Awareness">Security Awareness</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Technical">Technical</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => setShowCreateCourse(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}