[Done] App Setup (Docker, Electron, React)
[Done] Navigation
[Done] Layout
[Done] Database Embed
- [Done] electron
- [Done] react  / ipcrender

[Done] hide menu
[Done] disable dev tools

[ToDo]

[Done] add list (file upload, select column, which to import, add new table and add bulk data)

[Done] show lists and specific list data

[Done] sort table by column

[Done] search

[Done] export (csv)

[Done] rename
[Done] delete list

[Done] remove duplicates from single list (keep oringal, craete two: without duplicate, and duplicate removed data)
[Done] remove emails / rows based on filter text e.g. junk word in email, @ missing
[Done] remove if emails missing

[Done] union / merge two or more lists together into new list
[Done] subtract list from another list(s) (create new list)
[Done] unique / common from list(s) (create new list)

[Bug]
[Fixed] map columns to first name, last name and email (to avoid mapping during ops) (means fixed columns, instead of dynamic)
- clear state when list changes

[Updates]

[Done] 100, 500, 1000, 5000 pagination
[x] csv no header support (can be supported but different upload flow is required)
[Done] by default email search
[Done] ctl + f keyboard search shortcut
[Done] email filter check (with comma seaparated list)
[Done] split domain (comma instead of space)
[Done] split by max 10 lists or count

[Done] add record
[Done] edit record
[Done] delete
[Done] (multiple) select for delete

> gmail duplicate check

[Done] add progress bar (on actions)
[Done] style update to blue

> csv without header

> subtract - email as key to eliminate (skip first_name, last_name)
> duplicate - preserver last row (instead of first)
> unique - first_name, last_name (found and copy)


-----------------

> Import:
✅ Remove duplicates (email) on import (keep first one matched)

- Flat list (+, “.”)
- Email extractor

[Done] Duplicate: 
✅ Flat list of gmail, outlook email accounts (having + for use with folder)
✅ Remove “.” (flat list)

> Email extractor: remove extra characters from email column (validate)

----

[Done] Subtract: 
✅ Parent - child (delete even if name exists or not) email based subtraction
✅ Multiple child lists
✅ On loop (remove child list one by one)

[Done] Merge:
✅ Keep name from parent (even if not null)
✅ After merge apply duplicate actions (and flat list)

> Unique:
- Use Parent name

---------------------------------

[Done] email, first, last (list view and export - Email, First, Last)
[Done] show toast little bit longer
[Done] remove duplicates order up (first)
[Done] yahoo, outlook flat
[Done] notificatio history for current view
[Done] new button to null data, email typos, flat, duplicate
[Done] merge, subtract -> trigger new button

> trigger master button on import