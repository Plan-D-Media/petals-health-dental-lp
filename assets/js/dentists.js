/* Petals Health Dental Clinic landing page: the "Meet Your Dentists" data.
   ============================================================================================================
   THIS FILE IS EMPTY ON PURPOSE. The client has not supplied any of it yet.

   While the list is empty the section does not exist on the page: no heading, no cards, no placeholder faces,
   no "Dr. Name" and no stock photography. tools/launch-check.mjs FAILS while it is empty.

   One entry per dentist, and all six fields are required. An entry missing any of them never renders.

     {
       name:          'Dr. <full name as the dentist is registered>',
       qualification: 'BDS' or 'BDS, MDS' (as awarded),
       speciality:    what they treat, in the client's own words,
       registration:  the Dental Council registration number, exactly as issued,
       photo:         'assets/img/dentists/<slug>.webp',   square, 480x480, up to 45 KB
       photoAlt:      a plain description of the photo, e.g. 'Dr. <name>, in the clinic'
     }

   The registration number is shown as plain text next to the qualification, prefixed "Reg. no.".
   Photos go in assets/img/dentists/. Nothing may sit in assets/img that the page does not use: the launch
   check fails a stray file, because everything under assets/ deploys to a public URL.
   ============================================================================================================ */
window.PETALS_DENTISTS = [];
