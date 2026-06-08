# Memory

## Project Overview
See @README.md for project overview and @package.json for available npm/pnpm commands for this project.

## Code Style Guidelines
- Use descriptive variable names
- Follow existing patterns in the codebase
- Extract complex conditions into meaningful boolean variables

## Architecture Notes
- **Session-Context Architecture**: Active company and employee contexts are attached directly to the user login token (`tokens` table) rather than passing `companyId`, `employeeId`, or `userId` in every API request. This prevents multi-device state collisions.
- **Middleware Integration**: The auth middleware extracts `activeCompanyId`, `activeEmployeeId`, and `userId` from the token and injects them into the `Express.Request` object.
- **Query / Payload Fallbacks**: Controller actions automatically default query parameters or request body properties to the active context values from `req` when omitted.

## Common Workflows
- Compile backend code: `npm run build` from `backend` directory.
- Run dev server: `npm run dev` from `backend` directory.
