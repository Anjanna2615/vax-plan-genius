
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, User, MapPin } from 'lucide-react';
import { Patient } from '@/pages/Index';

interface PatientProfileProps {
  onPatientUpdate: (patient: Patient) => void;
  currentPatient: Patient | null;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ 
  onPatientUpdate, 
  currentPatient 
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>(
    currentPatient || {
      name: '',
      age: 0,
      dateOfBirth: '',
      healthConditions: [],
      allergies: [],
      travelPlans: [],
      previousVaccinations: [],
      riskFactors: []
    }
  );

  const [healthConditionsText, setHealthConditionsText] = useState(
    currentPatient?.healthConditions?.join(', ') || ''
  );
  const [allergiesText, setAllergiesText] = useState(
    currentPatient?.allergies?.join(', ') || ''
  );

  const [newTravelPlan, setNewTravelPlan] = useState({
    destination: '',
    departureDate: '',
    returnDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient: Patient = {
      id: currentPatient?.id || Date.now().toString(),
      name: formData.name || '',
      age: formData.age || 0,
      dateOfBirth: formData.dateOfBirth || '',
      healthConditions: healthConditionsText ? healthConditionsText.split(',').map(item => item.trim()) : [],
      allergies: allergiesText ? allergiesText.split(',').map(item => item.trim()) : [],
      travelPlans: formData.travelPlans || [],
      previousVaccinations: formData.previousVaccinations || [],
      riskFactors: formData.riskFactors || []
    };
    onPatientUpdate(patient);
  };

  const addTravelPlan = () => {
    if (newTravelPlan.destination && newTravelPlan.departureDate) {
      setFormData({
        ...formData,
        travelPlans: [...(formData.travelPlans || []), newTravelPlan]
      });
      setNewTravelPlan({ destination: '', departureDate: '', returnDate: '' });
    }
  };

  const removeTravelPlan = (index: number) => {
    setFormData({
      ...formData,
      travelPlans: formData.travelPlans?.filter((_, i) => i !== index) || []
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-6 w-6 mr-2 text-blue-600" />
          Patient Profile
        </CardTitle>
        <CardDescription>
          Enter patient information to generate personalized vaccination recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter patient name"
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                placeholder="Age in years"
                required
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Health Conditions - Simplified */}
          <div>
            <Label htmlFor="healthConditions" className="text-base font-semibold">Health Conditions</Label>
            <Textarea
              id="healthConditions"
              placeholder="Enter health conditions separated by commas (e.g., Diabetes, Asthma, Heart Disease)"
              value={healthConditionsText}
              onChange={(e) => setHealthConditionsText(e.target.value)}
              className="mt-2"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple conditions with commas</p>
          </div>

          {/* Allergies - Simplified */}
          <div>
            <Label htmlFor="allergies" className="text-base font-semibold">Allergies & Contraindications</Label>
            <Textarea
              id="allergies"
              placeholder="Enter allergies separated by commas (e.g., Eggs, Penicillin, Previous vaccine reactions)"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              className="mt-2"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple allergies with commas</p>
          </div>

          {/* Travel Plans - Simplified */}
          <div>
            <Label className="text-base font-semibold flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Travel Plans
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <Input
                placeholder="Destination"
                value={newTravelPlan.destination}
                onChange={(e) => setNewTravelPlan({ ...newTravelPlan, destination: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Departure Date"
                value={newTravelPlan.departureDate}
                onChange={(e) => setNewTravelPlan({ ...newTravelPlan, departureDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Return Date"
                value={newTravelPlan.returnDate}
                onChange={(e) => setNewTravelPlan({ ...newTravelPlan, returnDate: e.target.value })}
              />
              <Button type="button" variant="outline" onClick={addTravelPlan}>
                <Plus className="h-4 w-4 mr-1" />
                Add Trip
              </Button>
            </div>
            <div className="space-y-2 mt-4">
              {formData.travelPlans?.map((trip, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium">{trip.destination}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {trip.departureDate} - {trip.returnDate || 'Open return'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTravelPlan(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Update Patient Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
