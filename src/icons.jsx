export function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {shapes[name] || shapes.dot}
    </svg>
  );
}

const shapes = {
  path: (
    <>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 7.2C12 7.5 14 10 15.2 14" />
    </>
  ),
  book: (
    <>
      <path d="M12 6v13" />
      <path d="M12 7C9.6 5.6 7 5.4 4.5 6.4v11.2C7 16.6 9.6 16.8 12 18" />
      <path d="M12 7c2.4-1.4 5-1.6 7.5-.6v11.2c-2.5-1-5.1-.8-7.5.4" />
    </>
  ),
  chat: (
    <>
      <path d="M5 6.5h14v9H9l-4 3.2z" />
    </>
  ),
  handbook: (
    <>
      <path d="M7 4.5h10v15H7z" />
      <path d="M10 8.5h4M10 12h4M10 15.5h2.5" />
    </>
  ),
  file: (
    <>
      <path d="M7 3.5h7l4 4V20H7z" />
      <path d="M14 3.5V8h4M9.5 12h5M9.5 15.5h5" />
    </>
  ),
  bag: (
    <>
      <path d="M8 9h8l1 11H7z" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4.5v1.8M12 17.7v1.8M4.5 12h1.8M17.7 12h1.8M6.4 6.4l1.3 1.3M16.3 16.3l1.3 1.3M17.6 6.4l-1.3 1.3M7.7 16.3l-1.3 1.3" />
    </>
  ),
  moon: (
    <path d="M15 4.8A7.2 7.2 0 1 0 19.2 15 5.6 5.6 0 0 1 15 4.8z" />
  ),
  phone: (
    <>
      <rect x="8" y="3.5" width="8" height="17" rx="2" />
      <path d="M11 17.5h2" />
    </>
  ),
  pen: (
    <>
      <path d="M14.5 4.5l5 5L9 20H4v-5z" />
      <path d="M13 6l5 5" />
    </>
  ),
  door: (
    <>
      <path d="M6 4h10v16H6z" />
      <path d="M14 12.2h.1" />
    </>
  ),
  lock: (
    <>
      <rect x="6" y="10" width="12" height="9" rx="1.5" />
      <path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2" />
    </>
  ),
  check: (
    <path d="M5 12.5l4.2 4.2L19 7.2" />
  ),
  headphones: (
    <>
      <path d="M5 13v2.5A2.5 2.5 0 0 0 7.5 18h1v-6h-1A2.5 2.5 0 0 0 5 14.5" />
      <path d="M19 13v2.5A2.5 2.5 0 0 1 16.5 18h-1v-6h1A2.5 2.5 0 0 1 19 14.5" />
      <path d="M5 13a7 7 0 0 1 14 0" />
    </>
  ),
  arrow: (
    <path d="M5 12h14M13 6l6 6-6 6" />
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <path d="M6 6l12 12M18 6L6 18" />
  ),
  life: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  list: (
    <>
      <path d="M9 7h10M9 12h10M9 17h10" />
      <path d="M5 7h.1M5 12h.1M5 17h.1" />
    </>
  ),
  cards: (
    <>
      <rect x="4" y="6" width="12" height="14" rx="1.5" />
      <path d="M8 4h12v14" />
    </>
  ),
  drop: (
    <path d="M12 4s5 5.2 5 9a5 5 0 0 1-10 0c0-3.8 5-9 5-9z" />
  ),
  tissue: (
    <>
      <path d="M5 9h14v9H5z" />
      <path d="M8 9c.4-2 1.6-3 4-3s3.6 1 4 3" />
    </>
  ),
  bottle: (
    <>
      <path d="M10 4h4v2l1.5 2.2V20H8.5V8.2L10 6z" />
    </>
  ),
  boot: (
    <>
      <path d="M8 4h5v8l4 2v3H5v-4l3-1.5z" />
    </>
  ),
  shirt: (
    <>
      <path d="M9 5l3 2 3-2 4 3-2 2-2-1v9H9V9L7 10 5 8z" />
    </>
  ),
  heart: (
    <path d="M12 19s-6.5-3.8-6.5-8A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 6.5 3c0 4.2-6.5 8-6.5 8z" />
  ),
  calendar: (
    <>
      <rect x="4.5" y="5.5" width="15" height="14" rx="1.5" />
      <path d="M8 4v3M16 4v3M4.5 10h15" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="2.4" />
      <circle cx="16" cy="10" r="2" />
      <path d="M4.8 18c.6-2.4 2.3-3.6 4.2-3.6s3.6 1.2 4.2 3.6" />
      <path d="M13.5 14.6c1.2-.4 2.4-.2 3.4.6 1 .8 1.5 1.8 1.7 2.8" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="8" rx="6" ry="2.4" />
      <path d="M6 8v4c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V8" />
      <path d="M6 12v4c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4v-4" />
    </>
  ),
  cap: (
    <>
      <path d="M3 10l9-4 9 4-9 4z" />
      <path d="M7 12v3.2c0 .8 2.2 2.3 5 2.3s5-1.5 5-2.3V12" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M7 10.8V19h10v-8.2" />
    </>
  ),
  print: (
    <>
      <path d="M7 8V4h10v4" />
      <path d="M6 16H4.5A1.5 1.5 0 0 1 3 14.5v-4A1.5 1.5 0 0 1 4.5 9h15A1.5 1.5 0 0 1 21 10.5v4a1.5 1.5 0 0 1-1.5 1.5H18" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  up: <path d="M6 14l6-6 6 6" />,
  down: <path d="M6 10l6 6 6-6" />,
  dot: <circle cx="12" cy="12" r="2" />,
};

export const photoAlt = {
  hero: "Νεοσύλλεκτος με παραλλαγή γελάει κρατώντας σφουγγαρίστρα σε στάση προσοχής",
  papers: "Στολή και στοίβα από στρατιωτικά έγγραφα",
  bag: "Στρατιωτική τσάντα σχεδόν άδεια· στολή, αρβύλα και πολιτικά ρούχα έξω",
  day0: "Νεοσύλλεκτος περιμένει μόνος στην ουρά έξω από το στρατόπεδο",
  nights: "Θάλαμος με κουκέτα, αρβύλα και γυαλιά ηλίου τη νύχτα",
  people: "Νεοσύλλεκτος με στολή μιλά στο τηλέφωνο δίπλα στο ρολόι",
  voice: "Σημειωματάριο και αυτοκόλλητα στην κουκέτα του θαλάμου",
  after: "Στρωμένη κουκέτα, στολή στη ντουλάπα και μέτρημα ημερών μέχρι την απόλυση",
};

export const chapterIcon = {
  papers: "file",
  bag: "bag",
  day0: "sun",
  nights: "moon",
  people: "phone",
  voice: "pen",
  after: "door",
};

export const worryIcon = {
  papers: "file",
  bag: "bag",
  body: "heart",
  home: "phone",
  money: "coins",
  calendar: "calendar",
  people: "users",
  after: "cap",
};

export const kitIcon = ["drop", "tissue", "bottle", "boot", "shirt", "phone", "moon"];

export const introIcon = ["file", "bag", "phone", "heart", "pen"];
