export default async function handler(req, res) {
    // Pengaturan CORS agar bisa diakses oleh halaman admin Anda
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { filePath, content } = req.body;

    if (!filePath || !content) {
        return res.status(400).json({ error: 'Data filePath atau content tidak lengkap.' });
    }

    // Mengambil Token dari Brankas Rahasia Vercel (Environment Variables)
    const token = process.env.GH_TOKEN;
    const username = "Nomad183";
    const repo = "KKN_ULAWENG2026";

    if (!token) {
        return res.status(500).json({ error: 'GitHub Token belum dikonfigurasi di server Vercel.' });
    }

    try {
        // Mengirim sinyal Repository Dispatch ke GitHub API
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/dispatches`, {
            method: "POST",
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                event_type: "update_json",
                client_payload: {
                    file_path: filePath,
                    content: content
                }
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            throw new Error(`Gagal memicu GitHub Actions: ${errData}`);
        }

        return res.status(200).json({ success: true, message: 'Berhasil memicu GitHub Actions!' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}