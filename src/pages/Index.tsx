
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientProfile } from '@/components/PatientProfile';
import { VaccineDatabase } from '@/components/VaccineDatabase';
import { ScheduleOptimizer } from '@/components/ScheduleOptimizer';
import { RiskAssessment } from '@/components/RiskAssessment';
import { ReminderSystem } from '@/components/ReminderSystem';
import { Calendar, Shield, Users, AlertTriangle } from 'lucide-react';

export interface Patient {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  healthConditions: string[];
  allergies: string[];
  travelPlans: {
    destination: string;
    departureDate: string;
    returnDate: string;
  }[];
  previousVaccinations: {
    vaccine: string;
    date: string;
    nextDue?: string;
  }[];
  riskFactors: string[];
}

export interface VaccineRecommendation {
  vaccine: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  reason: string;
  riskScore: number;
  interactions: string[];
}

const Index = () => {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [recommendations, setRecommendations] = useState<VaccineRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  const handlePatientUpdate = (patient: Patient) => {
    setCurrentPatient(patient);
    console.log('Patient profile updated:', patient);
  };

  const handleRecommendationsUpdate = (newRecommendations: VaccineRecommendation[]) => {
    setRecommendations(newRecommendations);
    console.log('Recommendations updated:', newRecommendations);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Vaccination Schedule Optimizer</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Intelligent personalized vaccination scheduling based on health profile, travel plans, and outbreak risk assessment
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled Vaccines</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendations.filter(r => r.priority === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Protection Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentPatient ? '85%' : '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Community Risk</p>
                  <p className="text-2xl font-bold text-gray-900">Medium</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="profile">Patient Profile</TabsTrigger>
            <TabsTrigger value="database">Vaccine Database</TabsTrigger>
            <TabsTrigger value="optimizer">Schedule Optimizer</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <PatientProfile 
              onPatientUpdate={handlePatientUpdate}
              currentPatient={currentPatient}
            />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <VaccineDatabase 
              patient={currentPatient}
              onRecommendationsUpdate={handleRecommendationsUpdate}
            />
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-6">
            <ScheduleOptimizer 
              patient={currentPatient}
              recommendations={recommendations}
            />
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <RiskAssessment 
              patient={currentPatient}
              recommendations={recommendations}
            />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <ReminderSystem 
              patient={currentPatient}
              recommendations={recommendations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
