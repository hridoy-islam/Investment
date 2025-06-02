import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

const EmploymentData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  // Update local data when userData changes
  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
    }
  };

  return (
    <TabSection
      title="Employment"
      description="Your employment history and current status"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        {/* Employment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Are you currently employed?</label>
          {isEditing ? (
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  id="employed-yes"
                  name="isEmployed"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={localData.isEmployed === 'yes'}
                  onChange={() => handleInputChange('isEmployed', 'yes')}
                />
                <label htmlFor="employed-yes" className="ml-2 block text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="employed-no"
                  name="isEmployed"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={localData.isEmployed === 'No'}
                  onChange={() => handleInputChange('isEmployed', 'No')}
                />
                <label htmlFor="employed-no" className="ml-2 block text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
          ) : (
            <div className="text-gray-900">{localData.isEmployed || '-'}</div>
          )}
        </div>

        {/* Current Employment */}
        {localData.isEmployed === 'yes' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Employment</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employer</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={localData.currentEmployment?.employer}
                      onChange={(e) =>
                        handleInputChange('currentEmployment', {
                          ...localData.currentEmployment,
                          employer: e.target.value
                        })
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{localData.currentEmployment?.employer || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={localData.currentEmployment?.jobTitle}
                      onChange={(e) =>
                        handleInputChange('currentEmployment', {
                          ...localData.currentEmployment,
                          jobTitle: e.target.value
                        })
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{localData.currentEmployment?.jobTitle || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={localData.currentEmployment?.startDate}
                      onChange={(e) =>
                        handleInputChange('currentEmployment', {
                          ...localData.currentEmployment,
                          startDate: e.target.value
                        })
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {localData.currentEmployment?.startDate
                        ? new Date(localData.currentEmployment.startDate).toLocaleDateString()
                        : '-'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  {isEditing ? (
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={localData.currentEmployment?.employmentType}
                      onChange={(e) =>
                        handleInputChange('currentEmployment', {
                          ...localData.currentEmployment,
                          employmentType: e.target.value
                        })
                      }
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  ) : (
                    <div className="mt-1 text-gray-900">{localData.currentEmployment?.employmentType || '-'}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={localData.currentEmployment?.responsibilities}
                      onChange={(e) =>
                        handleInputChange('currentEmployment', {
                          ...localData.currentEmployment,
                          responsibilities: e.target.value
                        })
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{localData.currentEmployment?.responsibilities || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={localData.currentEmployment?.supervisor}
                      onChange={(e) =>
                        handleInputChange('currentEmployment', {
                          ...localData.currentEmployment,
                          supervisor: e.target.value
                        })
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{localData.currentEmployment?.supervisor || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permission to Contact</label>
                  {isEditing ? (
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={localData.currentEmployment?.contactPermission}
                      onChange={(e) =>
                        handleInputChange('currentEmployment', {
                          ...localData.currentEmployment,
                          contactPermission: e.target.value
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <div className="mt-1 text-gray-900">{localData.currentEmployment?.contactPermission || '-'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Has Previous Employment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you have previous employment?
          </label>
          {isEditing ? (
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  id="has-prev-yes"
                  name="hasPreviousEmployment"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={localData.hasPreviousEmployment === 'yes'}
                  onChange={() => handleInputChange('hasPreviousEmployment', 'yes')}
                />
                <label htmlFor="has-prev-yes" className="ml-2 block text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="has-prev-no"
                  name="hasPreviousEmployment"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={localData.hasPreviousEmployment === 'No'}
                  onChange={() => handleInputChange('hasPreviousEmployment', 'No')}
                />
                <label htmlFor="has-prev-no" className="ml-2 block text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
          ) : (
            <div className="text-gray-900">{localData.hasPreviousEmployment || '-'}</div>
          )}
        </div>

        {/* Previous Employment List */}
        {(localData.hasPreviousEmployment === 'yes') && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Previous Employment</h3>
              {isEditing && (
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() =>
                    handleInputChange('previousEmployments', [
                      ...(localData.previousEmployments || []),
                      {
                        employer: '',
                        jobTitle: '',
                        startDate: '',
                        endDate: '',
                        reasonForLeaving: '',
                        responsibilities: '',
                        contactPermission: ''
                      }
                    ])
                  }
                >
                  <Plus size={16} className="mr-2" />
                  Add Previous Job
                </button>
              )}
            </div>

            {localData.previousEmployments && localData.previousEmployments.length > 0 ? (
              <div className="space-y-4">
                {localData.previousEmployments.map((job, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                    {isEditing && (
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        title="Remove"
                        onClick={() =>
                          handleInputChange(
                            'previousEmployments',
                            localData.previousEmployments.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Employer</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={job.employer}
                            onChange={(e) =>
                              handleInputChange('previousEmployments', [
                                ...localData.previousEmployments.slice(0, index),
                                { ...job, employer: e.target.value },
                                ...localData.previousEmployments.slice(index + 1)
                              ])
                            }
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.employer || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={job.jobTitle}
                            onChange={(e) =>
                              handleInputChange('previousEmployments', [
                                ...localData.previousEmployments.slice(0, index),
                                { ...job, jobTitle: e.target.value },
                                ...localData.previousEmployments.slice(index + 1)
                              ])
                            }
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.jobTitle || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        {isEditing ? (
                          <input
                            type="date"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={job.startDate}
                            onChange={(e) =>
                              handleInputChange('previousEmployments', [
                                ...localData.previousEmployments.slice(0, index),
                                { ...job, startDate: e.target.value },
                                ...localData.previousEmployments.slice(index + 1)
                              ])
                            }
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">
                            {job.startDate ? new Date(job.startDate).toLocaleDateString() : '-'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        {isEditing ? (
                          <input
                            type="date"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={job.endDate}
                            onChange={(e) =>
                              handleInputChange('previousEmployments', [
                                ...localData.previousEmployments.slice(0, index),
                                { ...job, endDate: e.target.value },
                                ...localData.previousEmployments.slice(index + 1)
                              ])
                            }
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">
                            {job.endDate ? new Date(job.endDate).toLocaleDateString() : '-'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reason for Leaving</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={job.reasonForLeaving}
                            onChange={(e) =>
                              handleInputChange('previousEmployments', [
                                ...localData.previousEmployments.slice(0, index),
                                { ...job, reasonForLeaving: e.target.value },
                                ...localData.previousEmployments.slice(index + 1)
                              ])
                            }
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.reasonForLeaving || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Permission to Contact</label>
                        {isEditing ? (
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={job.contactPermission}
                            onChange={(e) =>
                              handleInputChange('previousEmployments', [
                                ...localData.previousEmployments.slice(0, index),
                                { ...job, contactPermission: e.target.value },
                                ...localData.previousEmployments.slice(index + 1)
                              ])
                            }
                          >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        ) : (
                          <div className="mt-1 text-gray-900">{job.contactPermission || '-'}</div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={job.responsibilities}
                            onChange={(e) =>
                              handleInputChange('previousEmployments', [
                                ...localData.previousEmployments.slice(0, index),
                                { ...job, responsibilities: e.target.value },
                                ...localData.previousEmployments.slice(index + 1)
                              ])
                            }
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.responsibilities || '-'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No previous employment records</p>
              </div>
            )}
          </div>
        )}

        {/* Employment Gaps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you have any gaps in your employment history?
          </label>
          {isEditing ? (
            <div className="flex space-x-4 mb-4">
              <div className="flex items-center">
                <input
                  id="gaps-yes"
                  name="hasEmploymentGaps"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={localData.hasEmploymentGaps === 'yes'}
                  onChange={() => handleInputChange('hasEmploymentGaps', 'yes')}
                />
                <label htmlFor="gaps-yes" className="ml-2 block text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="gaps-no"
                  name="hasEmploymentGaps"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={localData.hasEmploymentGaps === 'No'}
                  onChange={() => handleInputChange('hasEmploymentGaps', 'No')}
                />
                <label htmlFor="gaps-no" className="ml-2 block text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
          ) : (
            <div className="text-gray-900 mb-4">{localData.hasEmploymentGaps || '-'}</div>
          )}
          {localData.hasEmploymentGaps === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Please explain any gaps in your employment history
              </label>
              {isEditing ? (
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={localData.employmentGapsExplanation}
                  onChange={(e) => handleInputChange('employmentGapsExplanation', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">{localData.employmentGapsExplanation || '-'}</div>
              )}
            </div>
          )}
        </div>

        {/* Declaration */}
        {isEditing && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="declaration"
                  name="declaration"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={localData.declaration}
                  onChange={(e) => handleInputChange('declaration', e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="declaration" className="font-medium text-gray-700">
                  Declaration
                </label>
                <p className="text-gray-500">
                  I confirm that the information provided above is true and accurate to the best of my knowledge.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </TabSection>
  );
};

export default EmploymentData;