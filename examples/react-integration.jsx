// React/Next.js Integration Example
// This shows how to use GoHighLevel in a React application

import { useState, useEffect } from 'react';
import axios from 'axios';

// Create an API service for your frontend
class GoHighLevelAPI {
  constructor(baseURL = '/api/ghl') {
    this.baseURL = baseURL;
  }
  
  async createContact(contactData) {
    const response = await axios.post(`${this.baseURL}/contacts`, contactData);
    return response.data;
  }
  
  async searchContacts(query) {
    const response = await axios.get(`${this.baseURL}/contacts/search`, {
      params: { q: query }
    });
    return response.data;
  }
  
  async sendMessage(messageData) {
    const response = await axios.post(`${this.baseURL}/messages`, messageData);
    return response.data;
  }
  
  async getAvailableSlots(calendarId, startDate, endDate) {
    const response = await axios.get(`${this.baseURL}/calendars/${calendarId}/slots`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
  
  async bookAppointment(appointmentData) {
    const response = await axios.post(`${this.baseURL}/appointments`, appointmentData);
    return response.data;
  }
}

// React component example
export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const ghlAPI = new GoHighLevelAPI();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const contactData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        locationId: process.env.NEXT_PUBLIC_GHL_LOCATION_ID
      };
      
      const result = await ghlAPI.createContact(contactData);
      setMessage(`Contact created successfully! ID: ${result.contact.id}`);
      
      // Reset form
      e.target.reset();
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Contact</h2>
      
      <div className="mb-4">
        <label className="block mb-2">First Name</label>
        <input
          type="text"
          name="firstName"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Last Name</label>
        <input
          type="text"
          name="lastName"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Email</label>
        <input
          type="email"
          name="email"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Phone</label>
        <input
          type="tel"
          name="phone"
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Contact'}
      </button>
      
      {message && (
        <div className={`mt-4 p-2 rounded ${message.includes('Error') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}
    </form>
  );
}

// Contact search component
export function ContactSearch() {
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const ghlAPI = new GoHighLevelAPI();
  
  const handleSearch = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const result = await ghlAPI.searchContacts(query);
      setContacts(result.contacts);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Search Contacts</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by name, email, or phone..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="space-y-2">
        {contacts.map((contact) => (
          <div key={contact.id} className="p-4 border rounded hover:bg-gray-50">
            <div className="font-semibold">
              {contact.firstName} {contact.lastName}
            </div>
            <div className="text-sm text-gray-600">
              {contact.email} • {contact.phone}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ID: {contact.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Appointment booking component
export function AppointmentBooking({ calendarId, contactId }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const ghlAPI = new GoHighLevelAPI();
  
  useEffect(() => {
    loadAvailableSlots();
  }, []);
  
  const loadAvailableSlots = async () => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    try {
      const result = await ghlAPI.getAvailableSlots(calendarId, startDate, endDate);
      setSlots(result.slots);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };
  
  const bookAppointment = async () => {
    if (!selectedSlot) return;
    
    setLoading(true);
    try {
      const result = await ghlAPI.bookAppointment({
        calendarId,
        contactId,
        locationId: process.env.NEXT_PUBLIC_GHL_LOCATION_ID,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        title: 'Consultation'
      });
      
      alert('Appointment booked successfully!');
      setSelectedSlot(null);
      loadAvailableSlots(); // Refresh slots
    } catch (error) {
      alert('Error booking appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
      
      <div className="space-y-2 mb-4">
        {slots.map((slot, index) => (
          <button
            key={index}
            onClick={() => setSelectedSlot(slot)}
            className={`w-full p-3 text-left border rounded hover:bg-gray-50 ${
              selectedSlot === slot ? 'bg-blue-50 border-blue-500' : ''
            }`}
          >
            {new Date(slot.startTime).toLocaleString()}
          </button>
        ))}
      </div>
      
      {selectedSlot && (
        <button
          onClick={bookAppointment}
          disabled={loading}
          className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      )}
    </div>
  );
}