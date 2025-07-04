
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, MapPin, Users, Shield } from 'lucide-react';
import { Patient, VaccineRecommendation } from '@/pages/Index';

interface RiskFactor {
  category: string;
  factor: string;
  riskLevel: 'low' | 'medium' | 'high';
  impact: number;
  description: string;
}

interface OutbreakData {
  disease: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  cases: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: string;
}

interface RiskAssessmentProps {
  patient: Patient | null;
  recommendations: VaccineRecommendation[];
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  patient,
  recommendations
}) => {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [outbreakData, setOutbreakData] = useState<OutbreakData[]>([]);
  const [overallRiskScore, setOverallRiskScore] = useState(0);

  // Mock outbreak data (in a real app, this would come from CDC/WHO APIs)
  const mockOutbreakData: OutbreakData[] = [
    {
      disease: 'Influenza A (H3N2)',
      location: 'United States',
      severity: 'medium',
      cases: 15420,
      trend: 'increasing',
      lastUpdated: '2024-01-15'
    },
    {
      disease: 'COVID-19',
      location: 'Global',
      severity: 'medium',
      cases: 1250000,
      trend: 'stable',
      lastUpdated: '2024-01-14'
    },
    {
      disease: 'Hepatitis A',
      location: 'Southeast Asia',
      severity: 'high',
      cases: 892,
      trend: 'increasing',
      lastUpdated: '2024-01-12'
    },
    {
      disease: 'Yellow Fever',
      location: 'West Africa',
      severity: 'high',
      cases: 234,
      trend: 'stable',
      lastUpdated: '2024-01-10'
    },
    {
      disease: 'Japanese Encephalitis',
      location: 'Eastern Asia',
      severity: 'medium',
      cases: 156,
      trend: 'decreasing',
      lastUpdated: '2024-01-08'
    }
  ];

  useEffect(() => {
    if (!patient) {
      setRiskFactors([]);
      setOverallRiskScore(0);
      return;
    }

    const factors = calculateRiskFactors(patient);
    const score = calculateOverallRisk(factors, patient);
    
    setRiskFactors(factors);
    setOverallRiskScore(score);
    setOutbreakData(mockOutbreakData);
  }, [patient, recommendations]);

  const calculateRiskFactors = (patient: Patient): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // Age-based risk factors
    if (patient.age >= 65) {
      factors.push({
        category: 'Demographics',
        factor: 'Advanced Age (65+)',
        riskLevel: 'high',
        impact: 25,
        description: 'Older adults have higher risk for severe complications from vaccine-preventable diseases'
      });
    } else if (patient.age <= 2) {
      factors.push({
        category: 'Demographics',
        factor: 'Young Age (<2 years)',
        riskLevel: 'high',
        impact: 20,
        description: 'Young children have immature immune systems and higher risk of complications'
      });
    }

    // Health condition risk factors
    const highRiskConditions = ['Immunocompromised', 'Heart Disease', 'Diabetes', 'Chronic Kidney Disease', 'Cancer'];
    const mediumRiskConditions = ['Asthma', 'COPD', 'Hypertension'];

    patient.healthConditions.forEach(condition => {
      if (highRiskConditions.includes(condition)) {
        factors.push({
          category: 'Health Conditions',
          factor: condition,
          riskLevel: 'high',
          impact: 20,
          description: `${condition} increases risk of severe complications from infectious diseases`
        });
      } else if (mediumRiskConditions.includes(condition)) {
        factors.push({
          category: 'Health Conditions',
          factor: condition,
          riskLevel: 'medium',
          impact: 10,
          description: `${condition} may increase risk of complications from certain diseases`
        });
      }
    });

    // Travel risk factors
    const highRiskDestinations = ['Sub-Saharan Africa', 'Southeast Asia', 'South America', 'India'];
    const mediumRiskDestinations = ['Eastern Europe', 'Central America', 'Middle East'];

    patient.travelPlans.forEach(trip => {
      const isHighRisk = highRiskDestinations.some(region => 
        trip.destination.toLowerCase().includes(region.toLowerCase())
      );
      const isMediumRisk = mediumRiskDestinations.some(region => 
        trip.destination.toLowerCase().includes(region.toLowerCase())
      );

      if (isHighRisk) {
        factors.push({
          category: 'Travel',
          factor: `High-risk travel to ${trip.destination}`,
          riskLevel: 'high',
          impact: 15,
          description: `Travel to ${trip.destination} requires additional vaccinations due to endemic diseases`
        });
      } else if (isMediumRisk) {
        factors.push({
          category: 'Travel',
          factor: `Medium-risk travel to ${trip.destination}`,
          riskLevel: 'medium',
          impact: 8,
          description: `Travel to ${trip.destination} may require additional precautions`
        });
      }
    });

    // Vaccination status risk factors
    const highPriorityVaccines = recommendations.filter(r => r.priority === 'high').length;
    if (highPriorityVaccines > 0) {
      factors.push({
        category: 'Vaccination Status',
        factor: `${highPriorityVaccines} high-priority vaccines needed`,
        riskLevel: 'high',
        impact: highPriorityVaccines * 5,
        description: 'Missing high-priority vaccinations increases disease susceptibility'
      });
    }

    return factors;
  };

  const calculateOverallRisk = (factors: RiskFactor[], patient: Patient): number => {
    const baseRisk = 20; // Everyone has some baseline risk
    const totalImpact = factors.reduce((sum, factor) => sum + factor.impact, 0);
    const riskScore = Math.min(100, baseRisk + totalImpact);
    
    console.log('Calculated risk score:', riskScore, 'from factors:', factors);
    return riskScore;
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getOverallRiskLevel = (score: number): { level: string; color: string } => {
    if (score >= 70) return { level: 'High Risk', color: 'text-red-600' };
    if (score >= 40) return { level: 'Medium Risk', color: 'text-yellow-600' };
    return { level: 'Low Risk', color: 'text-green-600' };
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'increasing' ? '↗️' : trend === 'decreasing' ? '↘️' : '→';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
    }
  };

  if (!patient) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Please complete patient profile to perform risk assessment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallRisk = getOverallRiskLevel(overallRiskScore);

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            Risk Assessment Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive risk analysis based on patient profile and current outbreak data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${overallRisk.color}`}>{overallRiskScore}%</div>
              <div className="text-sm text-gray-600">Overall Risk Score</div>
              <div className={`text-sm font-medium ${overallRisk.color}`}>{overallRisk.level}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{riskFactors.length}</div>
              <div className="text-sm text-gray-600">Risk Factors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {recommendations.filter(r => r.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority Vaccines</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Risk Level</span>
              <span className={`text-sm font-medium ${overallRisk.color}`}>{overallRisk.level}</span>
            </div>
            <Progress value={overallRiskScore} className="h-3" />
          </div>

          {overallRiskScore >= 70 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                High risk profile identified. Immediate vaccination consultation recommended.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors Breakdown */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            Individual Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskFactors.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(
                riskFactors.reduce((acc, factor) => {
                  if (!acc[factor.category]) acc[factor.category] = [];
                  acc[factor.category].push(factor);
                  return acc;
                }, {} as Record<string, RiskFactor[]>)
              ).map(([category, factors]) => (
                <div key={category}>
                  <h4 className="font-semibold mb-3 text-gray-800">{category}</h4>
                  <div className="space-y-2">
                    {factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="font-medium">{factor.factor}</span>
                            <Badge className={`ml-2 ${getRiskColor(factor.riskLevel)}`}>
                              {factor.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{factor.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-gray-700">+{factor.impact}</div>
                          <div className="text-xs text-gray-500">risk points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <p>No significant risk factors identified</p>
              <p className="text-sm mt-2">Continue with routine vaccination schedule</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outbreak Monitoring */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-red-600" />
            Current Disease Outbreaks
          </CardTitle>
          <CardDescription>
            Real-time monitoring of disease outbreaks that may affect vaccination priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outbreakData.map((outbreak, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{outbreak.disease}</h4>
                  <Badge className={getRiskColor(outbreak.severity)}>
                    {outbreak.severity}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                    <span>{outbreak.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cases: {outbreak.cases.toLocaleString()}</span>
                    <span className={`flex items-center ${getSeverityColor(outbreak.severity)}`}>
                      {getTrendIcon(outbreak.trend)} {outbreak.trend}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(outbreak.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Population Health Impact</span>
            </div>
            <p className="text-sm text-blue-700">
              Current outbreak patterns suggest increased importance for {' '}
              {patient.travelPlans.length > 0 ? 'travel-related vaccines' : 'routine immunizations'} 
              {' '} to maintain herd immunity and individual protection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
