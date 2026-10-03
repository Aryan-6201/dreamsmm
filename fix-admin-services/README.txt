DreamSMM Admin Services Fix

This is the ACTUAL install bundle.

What it fixes:
- Manual admin service creation ensures the category exists.
- Provider imports ensure a category exists before creating the service.
- Existing services can be repaired through /api/admin/services/repair-categories.
- Admin page refreshes categories after MicoSMM import.
- Removes several duplicate/debug UI issues.
- Does NOT add an Uncategorized section.

Install:
1. Extract this ZIP into the DreamSMM project root.
2. Run:
   .\install-admin-services-fix.ps1
3. Verify:
   .\verify-admin-services.ps1
4. Build:
   npm run build
5. Start:
   npm run dev
6. While logged into the admin panel, repair existing services using the browser console:
   fetch('/api/admin/services/repair-categories',{method:'POST'}).then(r=>r.json()).then(console.log)

A timestamped backup is created automatically before modifications.
