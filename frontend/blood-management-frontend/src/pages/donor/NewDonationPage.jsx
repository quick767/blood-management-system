import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Heart, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { donationsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const NewDonationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    donationDate: '',
    donationTime: '',
    location: {
      center: '',
      address: {
        street: '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || ''
      }
    },
    medicalScreening: {
      hemoglobin: '',
      bloodPressure: {
        systolic: '',
        diastolic: ''
      },
      temperature: '',
      weight: user?.medicalInfo?.weight || '',
      pulse: ''
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
      // Combine date and time
      const donationDateTime = new Date(`${formData.donationDate}T${formData.donationTime}`);
      
      const donationData = {
        ...formData,
        donationDate: donationDateTime,
        bloodGroup: user.bloodGroup,
        quantity: 450 // Standard donation amount
      };

      delete donationData.donationTime; // Remove separate time field

      const response = await donationsAPI.create(donationData);
      
      if (response.data) {
        toast.success('Donation scheduled successfully!');
        navigate('/dashboard/donations');
      }
    } catch (error) {
      console.error('Donation scheduling error:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule donation');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Schedule New Donation</h1>
          <p className="text-muted-foreground">
            Thank you for choosing to donate blood. Please fill out the form below to schedule your donation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Donor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Donor Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={user?.name} disabled />
              </div>
              <div>
                <Label>Blood Group</Label>
                <Input value={user?.bloodGroup} disabled />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={user?.phone} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Donation Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Donation Schedule</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred date and time for donation
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donationDate">Donation Date *</Label>
                <Input
                  id="donationDate"
                  name="donationDate"
                  type="date"
                  min={today}
                  max={maxDateStr}
                  value={formData.donationDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="donationTime">Preferred Time *</Label>
                <Input
                  id="donationTime"
                  name="donationTime"
                  type="time"
                  min="08:00"
                  max="18:00"
                  value={formData.donationTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Donation Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="center">Donation Center *</Label>
                <Select
                  value={formData.location.center}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, center: value }
                  }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select donation center" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="City Blood Bank">City Blood Bank</SelectItem>
                    <SelectItem value="General Hospital">General Hospital</SelectItem>
                    <SelectItem value="Red Cross Center">Red Cross Center</SelectItem>
                    <SelectItem value="Community Health Center">Community Health Center</SelectItem>
                    <SelectItem value="Mobile Blood Drive">Mobile Blood Drive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="location.address.street"
                    placeholder="Enter street address"
                    value={formData.location.address.street}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="location.address.city"
                    placeholder="Enter city"
                    value={formData.location.address.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="location.address.state"
                    placeholder="Enter state"
                    value={formData.location.address.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    name="location.address.zipCode"
                    placeholder="Enter zip code"
                    value={formData.location.address.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Screening */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Pre-Donation Medical Information</span>
              </CardTitle>
              <CardDescription>
                Please provide your current health information (will be verified at donation center)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hemoglobin">Hemoglobin Level (g/dL)</Label>
                  <Input
                    id="hemoglobin"
                    name="medicalScreening.hemoglobin"
                    type="number"
                    step="0.1"
                    min="12"
                    max="20"
                    placeholder="e.g., 14.5"
                    value={formData.medicalScreening.hemoglobin}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    name="medicalScreening.weight"
                    type="number"
                    min="45"
                    max="200"
                    placeholder="e.g., 70"
                    value={formData.medicalScreening.weight}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    name="medicalScreening.temperature"
                    type="number"
                    step="0.1"
                    min="36"
                    max="38"
                    placeholder="e.g., 36.5"
                    value={formData.medicalScreening.temperature}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
                  <Input
                    id="systolic"
                    name="medicalScreening.bloodPressure.systolic"
                    type="number"
                    min="90"
                    max="180"
                    placeholder="e.g., 120"
                    value={formData.medicalScreening.bloodPressure.systolic}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
                  <Input
                    id="diastolic"
                    name="medicalScreening.bloodPressure.diastolic"
                    type="number"
                    min="60"
                    max="100"
                    placeholder="e.g., 80"
                    value={formData.medicalScreening.bloodPressure.diastolic}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
                  <Input
                    id="pulse"
                    name="medicalScreening.pulse"
                    type="number"
                    min="50"
                    max="100"
                    placeholder="e.g., 72"
                    value={formData.medicalScreening.pulse}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Any additional information or special requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                placeholder="Enter any additional notes, medical conditions, or special requirements..."
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
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Donation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDonationPage;
