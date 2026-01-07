# TODO: Implement User Name from Token and Protected Routes

## Backend Changes
- [ ] Update authController.js to include user name in JWT token payload
- [ ] Apply protect middleware to userRoutes.js, chatRoutes.js, and messageRoutes.js
- [ ] Test protected routes to ensure they require valid token

## Frontend Changes
- [ ] Create a utility function to decode JWT token and extract user name
- [ ] Update dashboard/index.jsx to display user name from token
- [ ] Implement route protection on frontend (check for token in localStorage, redirect to login if not present)
- [ ] Update App.js to handle protected routes

## Testing
- [ ] Test login flow and verify token contains name
- [ ] Test accessing protected routes without token (should fail)
- [ ] Test accessing protected routes with valid token (should succeed)
- [ ] Verify user name displays correctly on dashboard
