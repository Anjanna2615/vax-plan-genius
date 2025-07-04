
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, Calendar, AlertTriangle, Info } from 'lucide-react';
import { Patient, VaccineRecommendation } from '@/pages/Index';

interface VaccineInfo {
  name: string;
  description: string;
  ageGroups: string[];
  contraindications: string[];
  interval: number; // days
  boosterRequired: boolean;
  travelRequired: string[];
  priority: 'routine' | 'high-risk' | 'travel' | 'outbreak';
  diseases: string[];
}

interface VaccineDatabaseProps {
  patient: Patient | null;
  onRecommendationsUpdate: (recommendations: VaccineRecommendation[]) => void;
}

const vaccineDatabase: VaccineInfo[] = [
  {
    name: 'COVID-19 (mRNA)',
    description: 'Protection against COVID-19 coronavirus',
    ageGroups: ['6+ months'],
    contraindications: ['Previous severe reaction', 'Allergic to mRNA components'],
    interval: 28,
    boosterRequired: true,
    travelRequired: [],
    priority: 'routine',
    diseases: ['COVID-19']
  },
  {
    name: 'Influenza (Flu)',
    description: 'Annual protection against seasonal influenza',
    ageGroups: ['6+ months'],
    contraindications: ['Eggs', 'Previous severe reaction', 'Guillain-Barré syndrome'],
    interval: 365,
    boosterRequired: true,
    travelRequired: [],
    priority: 'routine',
    diseases: ['Influenza A', 'Influenza B']
  },
  {
    name: 'Tetanus-Diphtheria (Td)',
    description: 'Protection against tetanus and diphtheria',
    ageGroups: ['11+ years'],
    contraindications: ['Previous severe reaction'],
    interval: 3650, // 10 years
    boosterRequired: true,
    travelRequired: [],
    priority: 'routine',
    diseases: ['Tetanus', 'Diphtheria']
  },
  {
    name: 'Hepatitis A',
    description: 'Protection against hepatitis A virus',
    ageGroups: ['12+ months'],
    contraindications: ['Previous severe reaction'],
    interval: 182, // 6 months for second dose
    boosterRequired: false,
    travelRequired: ['Asia', 'Africa', 'Central America', 'South America'],
    priority: 'travel',
    diseases: ['Hepatitis A']
  },
  {
    name: 'Hepatitis B',
    description: 'Protection against hepatitis B virus',
    ageGroups: ['Birth+'],
    contraindications: ['Previous severe reaction', 'Yeast'],
    interval: 28,
    boosterRequired: false,
    travelRequired: ['Asia', 'Africa', 'Eastern Europe'],
    priority: 'routine',
    diseases: ['Hepatitis B']
  },
  {
    name: 'Japanese Encephalitis',
    description: 'Protection against Japanese encephalitis virus',
    ageGroups: ['2+ months'],
    contraindications: ['Previous severe reaction'],
    interval: 28,
    boosterRequired: true,
    travelRequired: ['Japan', 'Korea', 'China', 'Southeast Asia', 'India'],
    priority: 'travel',
    diseases: ['Japanese Encephalitis']
  },
  {
    name: 'Yellow Fever',
    description: 'Protection against yellow fever virus',
    ageGroups: ['9+ months'],
    contraindications: ['Immunocompromised', 'Eggs', '60+ years (relative)'],
    interval: 0, // Single dose lifetime protection
    boosterRequired: false,
    travelRequired: ['Sub-Saharan Africa', 'Tropical South America'],
    priority: 'travel',
    diseases: ['Yellow Fever']
  },
  {
    name: 'Typhoid',
    description: 'Protection against typhoid fever',
    ageGroups: ['2+ years'],
    contraindications: ['Immunocompromised', 'Previous severe reaction'],
    interval: 1095, // 3 years
    boosterRequired: true,
    travelRequired: ['India', 'Southeast Asia', 'Africa', 'Central America'],
    priority: 'travel',
    diseases: ['Typhoid Fever']
  },
  {
    name: 'Meningococcal ACWY',
    description: 'Protection against meningococcal disease',
    ageGroups: ['11-12 years', '16 years (booster)'],
    contraindications: ['Previous severe reaction'],
    interval: 1825, // 5 years
    boosterRequired: true,
    travelRequired: ['Sub-Saharan Africa', 'Saudi Arabia (Hajj)'],
    priority: 'high-risk',
    diseases: ['Meningococcal Disease']
  },
  {
    name: 'Pneumococcal (PPSV23)',
    description: 'Protection against pneumococcal disease',
    ageGroups: ['65+ years', '2-64 years (high-risk)'],
    contraindications: ['Previous severe reaction'],
    interval: 1825, // 5 years for high-risk
    boosterRequired: true,
    travelRequired: [],
    priority: 'high-risk',
    diseases: ['Pneumococcal Disease']
  }
];

export const VaccineDatabase: React.FC<VaccineDatabaseProps> = ({ 
  patient, 
  onRecommendationsUpdate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineInfo | null>(null);
  const [eligibilityResults, setEligibilityResults] = useState<{[key: string]: boolean}>({});

  const filteredVaccines = vaccineDatabase.filter(vaccine =>
    vaccine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaccine.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaccine.diseases.some(disease => disease.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate eligibility and generate recommendations
  useEffect(() => {
    if (!patient) return;

    const eligibility: {[key: string]: boolean} = {};
    const recommendations: VaccineRecommendation[] = [];

    vaccineDatabase.forEach(vaccine => {
      const isEligible = checkEligibility(vaccine, patient);
      eligibility[vaccine.name] = isEligible;

      if (isEligible) {
        const recommendation = generateRecommendation(vaccine, patient);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    });

    setEligibilityResults(eligibility);
    onRecommendationsUpdate(recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  }, [patient, onRecommendationsUpdate]);

  const checkEligibility = (vaccine: VaccineInfo, patient: Patient): boolean => {
    console.log(`Checking eligibility for ${vaccine.name}:`, vaccine, patient);

    // Check age eligibility
    const ageEligible = vaccine.ageGroups.some(ageGroup => {
      if (ageGroup === 'Birth+') return true;
      if (ageGroup.includes('+')) {
        const minAge = parseInt(ageGroup.split('+')[0]);
        return patient.age >= minAge;
      }
      if (ageGroup.includes('-')) {
        const [min, max] = ageGroup.split('-').map(age => parseInt(age.split(' ')[0]));
        return patient.age >= min && patient.age <= max;
      }
      return true;
    });

    if (!ageEligible) return false;

    // Check contraindications
    const hasContraindication = vaccine.contraindications.some(contraindication =>
      patient.allergies.some(allergy => 
        allergy.toLowerCase().includes(contraindication.toLowerCase()) ||
        contraindication.toLowerCase().includes(allergy.toLowerCase())
      ) ||
      patient.healthConditions.some(condition =>
        condition.toLowerCase().includes(contraindication.toLowerCase()) ||
        contraindication.toLowerCase().includes(condition.toLowerCase())
      )
    );

    if (hasContraindication) return false;

    // Check if travel vaccine is needed
    if (vaccine.priority === 'travel' && vaccine.travelRequired.length > 0) {
      const needsForTravel = patient.travelPlans.some(trip =>
        vaccine.travelRequired.some(region =>
          trip.destination.toLowerCase().includes(region.toLowerCase()) ||
          region.toLowerCase().includes(trip.destination.toLowerCase())
        )
      );
      if (!needsForTravel) return false;
    }

    return true;
  };

  const generateRecommendation = (vaccine: VaccineInfo, patient: Patient): VaccineRecommendation | null => {
    // Check if already vaccinated recently
    const previousVaccination = patient.previousVaccinations.find(v => 
      v.vaccine.toLowerCase().includes(vaccine.name.toLowerCase())
    );

    let dueDate = new Date();
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let reason = '';
    let riskScore = 50;

    // Calculate priority and due date
    if (vaccine.priority === 'routine') {
      priority = 'medium';
      reason = 'Routine vaccination recommended for age group';
      riskScore = 60;
    } else if (vaccine.priority === 'high-risk') {
      const hasRiskFactors = patient.healthConditions.some(condition =>
        ['Diabetes', 'Heart Disease', 'Immunocompromised', 'Chronic Kidney Disease', 'COPD'].includes(condition)
      );
      if (hasRiskFactors || patient.age >= 65) {
        priority = 'high';
        reason = 'High-risk patient - priority vaccination';
        riskScore = 85;
      } else {
        return null;
      }
    } else if (vaccine.priority === 'travel') {
      const urgentTravel = patient.travelPlans.some(trip => {
        const daysUntilTravel = Math.floor((new Date(trip.departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilTravel <= 30;
      });
      priority = urgentTravel ? 'high' : 'medium';
      reason = urgentTravel ? 'Urgent travel vaccination needed' : 'Travel vaccination recommended';
      riskScore = urgentTravel ? 80 : 65;
      
      if (urgentTravel) {
        dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
      } else {
        dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
      }
    }

    // Adjust due date based on previous vaccination
    if (previousVaccination) {
      const daysSinceLast = Math.floor((new Date().getTime() - new Date(previousVaccination.date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLast < vaccine.interval) {
        const nextDueDate = new Date(new Date(previousVaccination.date).getTime() + vaccine.interval * 24 * 60 * 60 * 1000);
        if (nextDueDate > new Date()) {
          dueDate = nextDueDate;
          priority = 'low';
          reason = `Next dose due based on previous vaccination`;
          riskScore = 30;
        }
      }
    }

    return {
      vaccine: vaccine.name,
      priority,
      dueDate: dueDate.toISOString().split('T')[0],
      reason,
      riskScore,
      interactions: vaccine.contraindications
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'routine': return 'bg-blue-100 text-blue-800';
      case 'high-risk': return 'bg-orange-100 text-orange-800';
      case 'travel': return 'bg-green-100 text-green-800';
      case 'outbreak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            Vaccine Database & Eligibility Checker
          </CardTitle>
          <CardDescription>
            Search vaccines and check eligibility based on patient profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vaccines by name, disease, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVaccines.map((vaccine) => {
              const isEligible = patient ? eligibilityResults[vaccine.name] : null;
              
              return (
                <Card 
                  key={vaccine.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isEligible === true ? 'border-green-300 bg-green-50' :
                    isEligible === false ? 'border-red-300 bg-red-50' :
                    'border-gray-200'
                  }`}
                  onClick={() => setSelectedVaccine(vaccine)}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm">{vaccine.name}</h3>
                      <Badge className={getPriorityColor(vaccine.priority)}>
                        {vaccine.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {vaccine.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {vaccine.ageGroups.join(', ')}
                      </div>
                      
                      {patient && (
                        <div className="flex items-center text-xs">
                          {isEligible === true ? (
                            <>
                              <Shield className="h-3 w-3 mr-1 text-green-600" />
                              <span className="text-green-600 font-medium">Eligible</span>
                            </>
                          ) : isEligible === false ? (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />
                              <span className="text-red-600 font-medium">Not Eligible</span>
                            </>
                          ) : (
                            <>
                              <Info className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-gray-500">Evaluating...</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedVaccine && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedVaccine.name} - Detailed Information</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedVaccine(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{selectedVaccine.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Age Groups</h4>
                <div className="space-y-1">
                  {selectedVaccine.ageGroups.map((group, index) => (
                    <Badge key={index} variant="outline">{group}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Protected Diseases</h4>
                <div className="space-y-1">
                  {selectedVaccine.diseases.map((disease, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800">{disease}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Contraindications</h4>
              <div className="space-y-1">
                {selectedVaccine.contraindications.map((contra, index) => (
                  <Badge key={index} className="bg-red-100 text-red-800">{contra}</Badge>
                ))}
              </div>
            </div>
            
            {selectedVaccine.travelRequired.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Required for Travel to</h4>
                <div className="space-y-1">
                  {selectedVaccine.travelRequired.map((region, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">{region}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <span className="font-semibold">Interval: </span>
                <span>{selectedVaccine.interval === 0 ? 'Single dose' : `${Math.floor(selectedVaccine.interval / 365)} years ${Math.floor((selectedVaccine.interval % 365) / 30)} months`}</span>
              </div>
              <div>
                <span className="font-semibold">Booster Required: </span>
                <span>{selectedVaccine.boosterRequired ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
