
import fetch from 'node-fetch';

const testApply = async () => {
    const payload = {
        job: {
            jobId: "12345",
            title: "Test Job",
            company: "Test Company",
            location: "Remote",
            salary: "100k",
            url: "http://example.com",
            description: "Test description"
        }
    };

    // We need a valid Mongo ID. Let's make a fake one.
    const fakeUserId = "65a1234567890abcdef12345";

    try {
        console.log("Sending request...");
        const res = await fetch('http://localhost:5000/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': fakeUserId
            },
            body: JSON.stringify(payload)
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response:", text);
    } catch (e) {
        console.error(e);
    }
};

testApply();
