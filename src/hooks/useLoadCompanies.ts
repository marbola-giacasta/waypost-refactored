import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { CompanyRecord, ParsedCompany } from '../utils/constants';

export const useLoadCompanies = () => {
  const [companies, setCompanies] = useState<ParsedCompany[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // ── 1. Load manifest ──────────────────────────────────────────
        const manifestRes = await fetch('/uploads/companies-manifest.json');
        if (!manifestRes.ok) throw new Error(`Manifest not found (HTTP ${manifestRes.status})`);
        const filenames: string[] = await manifestRes.json();

        if (!filenames.length) {
          console.warn('useLoadCompanies: manifest is empty');
          return;
        }

        // ── 2. Fetch and parse each file in parallel ──────────────────
        const allRows: ParsedCompany[] = [];

        await Promise.all(
          filenames.map(async (filename) => {
            try {
              const res = await fetch(`/uploads/${filename}`);
              if (!res.ok) {
                console.warn(`useLoadCompanies: skipping ${filename} (HTTP ${res.status})`);
                return;
              }
              const buf = await res.arrayBuffer();
              const wb  = XLSX.read(buf, { type: 'array' });
              const raw = XLSX.utils.sheet_to_json<CompanyRecord>(
                wb.Sheets[wb.SheetNames[0]],
                { raw: true, defval: '' },
              );
              const parsed = raw
                .filter(c => c['Company Name'])
                .map(c => ({
                  ...c,
                  // Use the real Location column; fall back to Switzerland
                  _sourceFile: String(c['Location'] ?? '').trim() || 'Switzerland',
                }));
              allRows.push(...parsed);
            } catch (fileErr) {
              console.warn(`useLoadCompanies: failed to load ${filename}`, fileErr);
            }
          }),
        );

        // ── 3. Deduplicate by Company Name ────────────────────────────
        const seen = new Set<string>();
        const deduped = allRows.filter(c => {
          const key = c['Company Name'].trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setCompanies(deduped);
      } catch (e) {
        console.error('useLoadCompanies:', e);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { companies, loading, error };
};