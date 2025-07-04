
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, AlertTriangle, CheckCircle, Info, Download } from 'lucide-react';
import { Patient, VaccineRecommendation } from '@/pages/Index';

interface ScheduleOptimizerProps {
  patient: Patient | null;
  recommendations: VaccineRecommendation[];
}

interface OptimizedSchedule {
  date: string;
  vaccines: VaccineRecommendation[];
  conflicts: string[];
  notes: string;
}

export const ScheduleOptimizer: React.FC<ScheduleOptimizerProps> = ({
  patient,
  recommendations
}) => {
  const [optimizedSchedule, setOptimizedSchedule] = useState<OptimizedSchedule[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3months' | '6months' | '1year'>('6months');

  useEffect(() => {
    if (!patient || recommendations.length === 0) {
      setOptimizedSchedule([]);
      return;
    }

    const schedule = generateOptimizedSchedule(recommendations, patient);
    setOptimizedSchedule(schedule);
  }, [patient, recommendations, selectedTimeframe]);

  const generateOptimizedSchedule = (recs: VaccineRecommendation[], patient: Patient): OptimizedSchedule[] => {
    console.log('Generating optimized schedule for:', recs.length, 'recommendations');
    
    // Sort recommendations by priority and due date
    const sortedRecs = [...recs].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const schedule: OptimizedSchedule[] = [];
    const vaccineIntervals: { [key: string]: number } = {
      'COVID-19 (mRNA)': 28,
      'Hepatitis A': 182,
      'Hepatitis B': 28,
      'Japanese Encephalitis': 28,
      'Typhoid': 1095,
      'Meningococcal ACWY': 1825
    };

    const processedVaccines = new Set<string>();
    let currentDate = new Date();

    sortedRecs.forEach((rec) => {
      if (processedVaccines.has(rec.vaccine)) return;

      const scheduledDate = new Date(Math.max(currentDate.getTime(), new Date(rec.dueDate).getTime()));
      
      // Check for existing appointments on the same day
      let existingAppointment = schedule.find(appt => 
        Math.abs(new Date(appt.date).getTime() - scheduledDate.getTime()) < 24 * 60 * 60 * 1000
      );

      const conflicts = checkVaccineConflicts(rec, existingAppointment?.vaccines || []);
      let notes = generateSchedulingNotes(rec, patient);

      if (existingAppointment && conflicts.length === 0) {
        // Add to existing appointment if no conflicts
        existingAppointment.vaccines.push(rec);
        existingAppointment.notes += ` ${notes}`;
      } else if (conflicts.length > 0) {
        // Schedule on a different day if there are conflicts
        const conflictFreeDate = new Date(scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week later
        schedule.push({
          date: conflictFreeDate.toISOString().split('T')[0],
          vaccines: [rec],
          conflicts,
          notes: `${notes} Rescheduled due to vaccine interactions.`
        });
      } else {
        // Create new appointment
        schedule.push({
          date: scheduledDate.toISOString().split('T')[0],
          vaccines: [rec],
          conflicts: [],
          notes
        });
      }

      processedVaccines.add(rec.vaccine);
      currentDate = new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000); // Next day minimum
    });

    return schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const checkVaccineConflicts = (newVaccine: VaccineRecommendation, existingVaccines: VaccineRecommendation[]): string[] => {
    const conflicts: string[] = [];

    // Check for live vaccine conflicts
    const liveVaccines = ['Yellow Fever', 'Japanese Encephalitis'];
    const isNewLive = liveVaccines.some(v => newVaccine.vaccine.includes(v));
    const hasExistingLive = existingVaccines.some(v => liveVaccines.some(lv => v.vaccine.includes(lv)));

    if (isNewLive && hasExistingLive) {
      conflicts.push('Multiple live vaccines scheduled - requires 4-week separation');
    }

    // Check for same-type vaccine conflicts
    if (existingVaccines.some(v => v.vaccine.includes('Hepatitis') && newVaccine.vaccine.includes('Hepatitis'))) {
      if (!existingVaccines.some(v => v.vaccine === newVaccine.vaccine)) {
        conflicts.push('Different hepatitis vaccines - consider combination vaccine');
      }
    }

    return conflicts;
  };

  const generateSchedulingNotes = (rec: VaccineRecommendation, patient: Patient): string => {
    const notes: string[] = [];

    if (rec.priority === 'high') {
      notes.push('High priority - schedule as soon as possible.');
    }

    if (rec.vaccine.includes('Travel') || rec.reason.includes('travel')) {
      const upcomingTravel = patient.travelPlans.find(trip => {
        const daysUntil = Math.floor((new Date(trip.departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 60 && daysUntil > 0;
      });
      if (upcomingTravel) {
        notes.push(`Required for travel to ${upcomingTravel.destination} on ${upcomingTravel.departureDate}.`);
      }
    }

    if (rec.interactions.length > 0) {
      notes.push(`Monitor for: ${rec.interactions.slice(0, 2).join(', ')}.`);
    }

    return notes.join(' ') || 'Routine vaccination as recommended.';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getProtectionScore = () => {
    if (!patient || recommendations.length === 0) return 0;
    
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
    const totalRecommendations = recommendations.length;
    const completedPercentage = Math.max(0, 100 - (totalRecommendations * 10));
    
    return Math.min(100, completedPercentage + (highPriorityCount > 0 ? -20 : 0));
  };

  const exportSchedule = () => {
    if (!optimizedSchedule.length) return;

    const scheduleText = optimizedSchedule.map(appt => {
      const vaccineList = appt.vaccines.map(v => `• ${v.vaccine} (${v.priority} priority)`).join('\n');
      return `Date: ${new Date(appt.date).toLocaleDateString()}\nVaccines:\n${vaccineList}\nNotes: ${appt.notes}\n---`;
    }).join('\n\n');

    const blob = new Blob([`Vaccination Schedule for ${patient?.name || 'Patient'}\n\n${scheduleText}`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaccination-schedule-${patient?.name || 'patient'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!patient) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Please complete patient profile to generate optimized vaccination schedule</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-blue-600" />
              Optimized Vaccination Schedule
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedTimeframe === '3months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('3months')}
              >
                3 Months
              </Button>
              <Button
                variant={selectedTimeframe === '6months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('6months')}
              >
                6 Months
              </Button>
              <Button
                variant={selectedTimeframe === '1year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('1year')}
              >
                1 Year
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            AI-optimized schedule balancing priority, timing constraints, and vaccine interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{optimizedSchedule.length}</div>
              <div className="text-sm text-gray-600">Appointments Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Total Vaccines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getProtectionScore()}%</div>
              <div className="text-sm text-gray-600">Protection Score</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Protection Level</span>
              <span className="text-sm text-gray-600">{getProtectionScore()}%</span>
            </div>
            <Progress value={getProtectionScore()} className="h-2" />
          </div>

          {optimizedSchedule.length > 0 && (
            <Button onClick={exportSchedule} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Schedule
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Schedule Timeline */}
      {optimizedSchedule.length > 0 ? (
        <div className="space-y-4">
          {optimizedSchedule.map((appointment, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.vaccines.length} vaccine{appointment.vaccines.length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {Math.floor((new Date(appointment.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {appointment.vaccines.map((vaccine, vIndex) => (
                    <div key={vIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                        <div>
                          <div className="font-medium">{vaccine.vaccine}</div>
                          <div className="text-sm text-gray-600">{vaccine.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(vaccine.priority)}>
                          {vaccine.priority}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          Risk: {vaccine.riskScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {appointment.conflicts.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Scheduling Conflicts</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {appointment.conflicts.map((conflict, cIndex) => (
                        <li key={cIndex}>• {conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {appointment.notes && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium text-blue-800 block mb-1">Scheduling Notes</span>
                        <p className="text-sm text-blue-700">{appointment.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No vaccination schedule generated yet</p>
              <p className="text-sm mt-2">Complete the vaccine database check to generate recommendations</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
