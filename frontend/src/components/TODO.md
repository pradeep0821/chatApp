# ChatBox.jsx Fix Plan

## Issue
React Hooks are being called conditionally after an early return, violating the Rules of Hooks.

## Solution
Move all useEffect hooks BEFORE the early return check.

## Steps
1. Move AUTO SCROLL useEffect (lines 59-71) before the early return
2. Move LOAD MESSAGES useEffect (lines 73-94) before the early return  
3. Move RECEIVE REAL-TIME MSG useEffect (lines 96-119) before the early return
4. Keep early return after all hooks

## Expected Result
- No more "React Hook useEffect is called conditionally" errors
- Webpack compiles successfully

