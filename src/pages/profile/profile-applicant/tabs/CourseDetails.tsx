import React from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface CourseDetailsProps {
  userData: User;
  isEditing?: boolean;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ userData, isEditing = false }) => {
  // Mock course data
  const mockCourseData = {
    course: 'MSc Computer Science',
    intake: 'September 2023'
  };

  const courseData = userData.courseDetailsData || mockCourseData;

  return (
    <TabSection 
      title="Course Details" 
      description="Information about your enrolled course" 
      userData={userData}
    >
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-indigo-800">
              {courseData.course}
            </h3>
            <p className="text-indigo-600 mt-1">Intake: {courseData.intake}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={courseData.course}
              >
                <option value="">Select course</option>
                <option value="BSc Computer Science">BSc Computer Science</option>
                <option value="MSc Computer Science">MSc Computer Science</option>
                <option value="BSc Data Science">BSc Data Science</option>
                <option value="MSc Data Science">MSc Data Science</option>
                <option value="BSc Business Management">BSc Business Management</option>
                <option value="MBA">MBA</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{courseData.course || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Intake</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={courseData.intake}
              >
                <option value="">Select intake</option>
                <option value="January 2023">January 2023</option>
                <option value="May 2023">May 2023</option>
                <option value="September 2023">September 2023</option>
                <option value="January 2024">January 2024</option>
                <option value="May 2024">May 2024</option>
                <option value="September 2024">September 2024</option>
              </select>
            ) : (
              <div className="mt-1 text-gray-900">{courseData.intake || '-'}</div>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Resources</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="#"
              className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Course Handbook</h4>
                <p className="text-xs text-gray-500">PDF Document</p>
              </div>
            </a>

            <a 
              href="#"
              className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Module Details</h4>
                <p className="text-xs text-gray-500">Course Structure</p>
              </div>
            </a>

            <a 
              href="#"
              className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Academic Calendar</h4>
                <p className="text-xs text-gray-500">Important Dates</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default CourseDetails;