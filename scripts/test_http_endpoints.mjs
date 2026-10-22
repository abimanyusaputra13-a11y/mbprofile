async function testEndpoints() {
  const routes = [
    {
      name: 'Courses Directory',
      url: 'http://localhost:3000/courses',
      expectedText: 'Ekonomi Mikro',
    },
    {
      name: 'Ekonomi Mikro Course Page',
      url: 'http://localhost:3000/courses/31293283-efc6-4761-ae66-ae809f814a9b',
      expectedText: 'Masuk Modul',
    },
    {
      name: 'Weekly Learning Page (Minggu 1-2)',
      url: 'http://localhost:3000/courses/31293283-efc6-4761-ae66-ae809f814a9b/weeks/94449ff8-31cf-4ba8-94b9-c60440ac5390',
      expectedText: 'Fondasi Teori Ekonomi Mikro',
    },
    {
      name: 'Weekly Quiz Taker (Minggu 1-2)',
      url: 'http://localhost:3000/courses/31293283-efc6-4761-ae66-ae809f814a9b/weeks/94449ff8-31cf-4ba8-94b9-c60440ac5390/quiz/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      expectedText: 'Kuis Evaluasi Mingguan 1-2',
    },
    {
      name: 'Pengantar Manajemen Bisnis Course Page',
      url: 'http://localhost:3000/courses/78cca0d7-8075-4a26-988b-76815a6ebde8',
      expectedText: 'Pengantar Manajemen Bisnis',
    },
    {
      name: 'Pengantar Manajemen Bisnis Weekly Learning Page',
      url: 'http://localhost:3000/courses/78cca0d7-8075-4a26-988b-76815a6ebde8/weeks/95dd14c4-37af-41e1-b33f-854dd57fccb0',
      expectedText: 'Business',
    },
  ];

  console.log('Testing Next.js HTTP server endpoints...');
  let allPassed = true;

  for (const route of routes) {
    try {
      const res = await fetch(route.url);
      const text = await res.text();
      const statusOk = res.status === 200;
      const textFound = text.includes(route.expectedText);

      if (statusOk && textFound) {
        console.log(`[PASS] ${route.name} (${route.url}) -> 200 OK, found "${route.expectedText}"`);
      } else {
        allPassed = false;
        console.error(`[FAIL] ${route.name} (${route.url}) -> Status: ${res.status}, foundText: ${textFound}`);
      }
    } catch (err) {
      allPassed = false;
      console.error(`[ERROR] ${route.name} -> ${err.message}`);
    }
  }

  if (allPassed) {
    console.log('\nAll 6 Next.js dynamic routes responded 200 OK with expected content!');
  } else {
    process.exit(1);
  }
}

testEndpoints();
