import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Heart, User, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { requestsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const NewRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    quantity: '',
    urgency: 'normal',
    requiredBy: '',
    patient: {
      name: '',
      age: '',
      gender: '',
      condition: '',
      hospital: ''
    },
    hospital: {
      name: '',
      address: {
        street: '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || ''
      },
      contactPerson: '',
      contactPhone: ''
    },
    medicalDetails: {
      diagnosis: '',
      bloodLoss: '',
      previousTransfusions: '',
      allergies: '',
      medications: ''
    },
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        requiredBy: new Date(formData.requiredBy),
        quantity: parseInt(formData.quantity),
        patient: {
          ...formData.patient,
          age: parseInt(formData.patient.age)
        }
      };

      const response = await requestsAPI.create(requestData);
      
      if (response.data) {
        toast.success('Blood request submitted successfully!');
        navigate('/dashboard/requests');
      }
    } catch (error) {
      console.error('Request submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit blood request');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (1 month from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">New Blood Request</h1>
          <p className="text-muted-foreground">
            Submit a blood request for a patient in need. Please provide accurate information to help us process your request quickly.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            For emergency requests, please call our 24/7 hotline: <strong>+1 (555) 123-4567</strong>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Request Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bloodType">Blood Type Required *</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity (Units) *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="e.g., 2"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical (Within 2 hours)</SelectItem>
                      <SelectItem value="urgent">Urgent (Within 24 hours)</SelectItem>
                      <SelectItem value="normal">Normal (Within 3 days)</SelectItem>
                      <SelectItem value="scheduled">Scheduled (Planned procedure)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="requiredBy">Required By Date *</Label>
                <Input
                  id="requiredBy"
                  name="requiredBy"
                  type="date"
                  min={today}
                  max={maxDateStr}
                  value={formData.requiredBy}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    name="patient.name"
                    placeholder="Enter patient's full name"
                    value={formData.patient.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="patientAge">Patient Age *</Label>
                  <Input
                    id="patientAge"
                    name="patient.age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g., 45"
                    value={formData.patient.age}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientGender">Patient Gender *</Label>
                  <Select
                    value={formData.patient.gender}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      patient: { ...prev.patient, gender: value }
                    }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="condition">Medical Condition *</Label>
                  <Input
                    id="condition"
                    name="patient.condition"
                    placeholder="e.g., Surgery, Accident, Anemia"
                    value={formData.patient.condition}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Hospital Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hospitalName">Hospital Name *</Label>
                  <Input
                    id="hospitalName"
                    name="hospital.name"
                    placeholder="Enter hospital name"
                    value={formData.hospital.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    name="hospital.contactPerson"
                    placeholder="Doctor/Nurse name"
                    value={formData.hospital.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    name="hospital.contactPhone"
                    placeholder="Hospital contact number"
                    value={formData.hospital.contactPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hospitalStreet">Street Address</Label>
                  <Input
                    id="hospitalStreet"
                    name="hospital.address.street"
                    placeholder="Enter street address"
                    value={formData.hospital.address.street}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hospitalCity">City *</Label>
                  <Input
                    id="hospitalCity"
                    name="hospital.address.city"
                    placeholder="Enter city"
                    value={formData.hospital.address.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hospitalState">State *</Label>
                  <Input
                    id="hospitalState"
                    name="hospital.address.state"
                    placeholder="Enter state"
                    value={formData.hospital.address.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hospitalZip">Zip Code *</Label>
                  <Input
                    id="hospitalZip"
                    name="hospital.address.zipCode"
                    placeholder="Enter zip code"
                    value={formData.hospital.address.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Details</CardTitle>
              <CardDescription>
                Additional medical information to help process the request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    name="medicalDetails.diagnosis"
                    placeholder="Medical diagnosis details..."
                    value={formData.medicalDetails.diagnosis}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bloodLoss">Blood Loss Details</Label>
                  <Textarea
                    id="bloodLoss"
                    name="medicalDetails.bloodLoss"
                    placeholder="Reason for blood requirement..."
                    value={formData.medicalDetails.bloodLoss}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="previousTransfusions">Previous Transfusions</Label>
                  <Textarea
                    id="previousTransfusions"
                    name="medicalDetails.previousTransfusions"
                    placeholder="Any previous blood transfusions..."
                    value={formData.medicalDetails.previousTransfusions}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    name="medicalDetails.allergies"
                    placeholder="Any known allergies..."
                    value={formData.medicalDetails.allergies}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  name="medicalDetails.medications"
                  placeholder="List current medications..."
                  value={formData.medicalDetails.medications}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Any additional information that might help process this request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                placeholder="Enter any additional notes, special requirements, or important information..."
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequestPage;
