# API Documentation - Blood Management System

This document provides comprehensive documentation for all API endpoints in the Blood Management System.

## 🔗 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📋 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## 🔑 Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "bloodGroup": "O+",
  "age": 25,
  "gender": "male",
  "role": "donor",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "bloodGroup": "O+",
      "isVerified": false,
      "isActive": true
    }
  },
  "message": "User registered successfully"
}
```

### Login User
**POST** `/auth/login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "bloodGroup": "O+"
    }
  },
  "message": "Login successful"
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "bloodGroup": "O+",
      "phone": "1234567890",
      "address": {
        "city": "New York",
        "state": "NY"
      }
    }
  }
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Send password reset email to user.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
**POST** `/auth/reset-password`

Reset user password using reset token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## 👥 User Management Endpoints

### Get All Users
**GET** `/users`

Get list of all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (donor, recipient, admin)
- `bloodGroup` (optional): Filter by blood group
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "donor",
        "bloodGroup": "O+",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get User by ID
**GET** `/users/:id`

Get specific user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "bloodGroup": "O+",
      "phone": "1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "medicalInfo": {
        "lastDonationDate": "2024-01-01T00:00:00.000Z",
        "canDonate": true
      }
    }
  }
}
```

### Update User
**PUT** `/users/:id`

Update user information.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "9876543210",
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101"
  }
}
```

### Delete User
**DELETE** `/users/:id`

Delete user account (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 🩸 Donation Management Endpoints

### Create Donation
**POST** `/donations`

Create a new blood donation record.

**Request Body:**
```json
{
  "bloodGroup": "O+",
  "quantity": 450,
  "donationDate": "2024-01-15T10:00:00.000Z",
  "location": {
    "center": "City Blood Bank",
    "address": "123 Health St, City, State"
  },
  "notes": "Regular donation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donation": {
      "_id": "donation-id",
      "donor": "user-id",
      "bloodGroup": "O+",
      "quantity": 450,
      "status": "pending",
      "donationDate": "2024-01-15T10:00:00.000Z",
      "location": {
        "center": "City Blood Bank",
        "address": "123 Health St, City, State"
      }
    }
  },
  "message": "Donation scheduled successfully"
}
```

### Get Donations
**GET** `/donations`

Get list of donations with filtering options.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending, approved, completed, rejected)
- `bloodGroup` (optional): Filter by blood group
- `donor` (optional): Filter by donor ID
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "_id": "donation-id",
        "donor": {
          "_id": "user-id",
          "name": "John Doe",
          "bloodGroup": "O+"
        },
        "bloodGroup": "O+",
        "quantity": 450,
        "status": "approved",
        "donationDate": "2024-01-15T10:00:00.000Z",
        "approvedAt": "2024-01-14T15:30:00.000Z",
        "approvedBy": "admin-id"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDonations": 25
    }
  }
}
```

### Approve Donation
**POST** `/donations/:id/approve`

Approve a pending donation (Admin only).

**Request Body:**
```json
{
  "notes": "Approved after medical screening"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donation": {
      "_id": "donation-id",
      "status": "approved",
      "approvedAt": "2024-01-14T15:30:00.000Z",
      "approvedBy": "admin-id"
    }
  },
  "message": "Donation approved successfully"
}
```

## 📋 Blood Request Endpoints

### Create Blood Request
**POST** `/requests`

Create a new blood request.

**Request Body:**
```json
{
  "bloodType": "O+",
  "quantity": 2,
  "urgency": "high",
  "patient": {
    "name": "Jane Smith",
    "age": 35,
    "gender": "female",
    "condition": "Surgery"
  },
  "hospital": {
    "name": "City General Hospital",
    "address": "456 Medical Ave, City, State",
    "contact": "9876543210"
  },
  "requiredBy": "2024-01-16T08:00:00.000Z",
  "notes": "Emergency surgery requirement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "request-id",
      "requester": "user-id",
      "bloodType": "O+",
      "quantity": 2,
      "urgency": "high",
      "status": "pending",
      "patient": {
        "name": "Jane Smith",
        "age": 35,
        "condition": "Surgery"
      },
      "hospital": {
        "name": "City General Hospital"
      },
      "requiredBy": "2024-01-16T08:00:00.000Z"
    }
  },
  "message": "Blood request created successfully"
}
```

### Get Blood Requests
**GET** `/requests`

Get list of blood requests.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `urgency` (optional): Filter by urgency
- `bloodType` (optional): Filter by blood type
- `requester` (optional): Filter by requester ID

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "request-id",
        "requester": {
          "_id": "user-id",
          "name": "John Doe"
        },
        "bloodType": "O+",
        "quantity": 2,
        "urgency": "high",
        "status": "pending",
        "patient": {
          "name": "Jane Smith",
          "condition": "Surgery"
        },
        "createdAt": "2024-01-15T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRequests": 15
    }
  }
}
```

### Fulfill Blood Request
**POST** `/requests/:id/fulfill`

Fulfill a blood request (Admin only).

**Request Body:**
```json
{
  "fulfilledQuantity": 2,
  "notes": "Blood units allocated from stock",
  "donationIds": ["donation-id-1", "donation-id-2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "request-id",
      "status": "fulfilled",
      "fulfilledAt": "2024-01-15T16:00:00.000Z",
      "fulfilledBy": "admin-id",
      "fulfilledQuantity": 2
    }
  },
  "message": "Blood request fulfilled successfully"
}
```

## 📊 Blood Stock Endpoints

### Get Blood Stock
**GET** `/stock`

Get current blood stock levels.

**Query Parameters:**
- `bloodGroup` (optional): Filter by specific blood group
- `status` (optional): Filter by stock status (critical, low, adequate, good)

**Response:**
```json
{
  "success": true,
  "data": {
    "stock": [
      {
        "bloodGroup": "O+",
        "totalUnits": 25,
        "availableUnits": 20,
        "reservedUnits": 5,
        "expiringUnits": 3,
        "status": "adequate",
        "lastUpdated": "2024-01-15T10:00:00.000Z"
      },
      {
        "bloodGroup": "O-",
        "totalUnits": 8,
        "availableUnits": 5,
        "reservedUnits": 3,
        "expiringUnits": 1,
        "status": "low",
        "lastUpdated": "2024-01-15T10:00:00.000Z"
      }
    ],
    "summary": {
      "totalUnits": 150,
      "availableUnits": 120,
      "criticalGroups": ["AB-", "O-"],
      "lowStockGroups": ["A-", "B-"]
    }
  }
}
```

### Update Blood Stock
**PUT** `/stock/:bloodGroup`

Update stock for specific blood group (Admin only).

**Request Body:**
```json
{
  "unitsAdded": 10,
  "unitsRemoved": 2,
  "reason": "New donations received",
  "expirationDate": "2024-03-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stock": {
      "bloodGroup": "O+",
      "totalUnits": 33,
      "availableUnits": 28,
      "status": "good",
      "lastUpdated": "2024-01-15T14:00:00.000Z"
    }
  },
  "message": "Stock updated successfully"
}
```

### Get Stock Alerts
**GET** `/stock/alerts`

Get active stock alerts (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "_id": "alert-id",
        "bloodGroup": "AB-",
        "alertType": "critical",
        "currentUnits": 2,
        "thresholdUnits": 5,
        "message": "Critical shortage of AB- blood",
        "createdAt": "2024-01-15T08:00:00.000Z",
        "acknowledged": false
      }
    ],
    "summary": {
      "totalAlerts": 3,
      "criticalAlerts": 1,
      "lowStockAlerts": 2
    }
  }
}
```

## 👨‍💼 Admin Endpoints

### Get Dashboard Data
**GET** `/admin/dashboard`

Get admin dashboard statistics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalDonors": 80,
      "totalRecipients": 65,
      "totalDonations": 200,
      "pendingDonations": 5,
      "totalRequests": 45,
      "pendingRequests": 8,
      "totalBloodUnits": 180
    },
    "recentActivity": [
      {
        "type": "donation",
        "message": "New donation from John Doe",
        "timestamp": "2024-01-15T10:00:00.000Z"
      }
    ],
    "bloodStockSummary": {
      "criticalGroups": ["AB-"],
      "lowStockGroups": ["A-", "B-"],
      "adequateGroups": ["O+", "A+", "B+", "AB+", "O-"]
    }
  }
}
```

### Get Analytics
**GET** `/admin/analytics`

Get detailed analytics data (Admin only).

**Query Parameters:**
- `period` (optional): Time period (week, month, quarter, year)
- `startDate` (optional): Start date for custom period
- `endDate` (optional): End date for custom period

**Response:**
```json
{
  "success": true,
  "data": {
    "donationTrends": {
      "labels": ["Jan", "Feb", "Mar", "Apr"],
      "data": [25, 30, 28, 35]
    },
    "requestTrends": {
      "labels": ["Jan", "Feb", "Mar", "Apr"],
      "data": [15, 18, 20, 22]
    },
    "bloodGroupDistribution": {
      "O+": 35,
      "O-": 8,
      "A+": 25,
      "A-": 6,
      "B+": 20,
      "B-": 4,
      "AB+": 8,
      "AB-": 2
    },
    "userGrowth": {
      "totalUsers": 150,
      "newUsersThisMonth": 12,
      "growthRate": 8.7
    }
  }
}
```

## 📧 Notification Endpoints

### Send Notification
**POST** `/notifications/send`

Send notification to users (Admin only).

**Request Body:**
```json
{
  "recipients": ["user-id-1", "user-id-2"],
  "type": "email",
  "subject": "Blood Donation Drive",
  "message": "Join our upcoming blood donation drive on January 20th.",
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notificationId": "notification-id",
    "sentCount": 2,
    "failedCount": 0
  },
  "message": "Notifications sent successfully"
}
```

## ❌ Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_EMAIL` | Email already exists |
| `INVALID_CREDENTIALS` | Invalid login credentials |
| `TOKEN_EXPIRED` | JWT token has expired |
| `INSUFFICIENT_STOCK` | Not enough blood units available |
| `DONATION_NOT_ELIGIBLE` | User not eligible for donation |
| `SERVER_ERROR` | Internal server error |

## 🔄 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Admin endpoints**: 200 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## 📝 Request/Response Examples

### Complete Registration Flow

1. **Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "bloodGroup": "O+",
    "age": 25,
    "gender": "male",
    "role": "donor",
    "address": {
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }'
```

2. **Login User**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. **Create Donation**
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bloodGroup": "O+",
    "quantity": 450,
    "donationDate": "2024-01-15T10:00:00.000Z",
    "location": {
      "center": "City Blood Bank",
      "address": "123 Health St, City, State"
    }
  }'
```

## 🔧 Testing the API

### Using curl
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/auth/me
```

### Using Postman
1. Import the API collection
2. Set environment variables for base URL and token
3. Run the test suite

### Using JavaScript/Axios
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get current user
const user = await api.get('/auth/me');
console.log(user.data);
```

---

**For more information or support, contact: support@bloodbank.com**

