import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { CompanyRecord, ParsedCompany } from '../utils/constants';

export const useLoadCompanies = () => {
  const [companies, setCompanies] = useState<ParsedCompany[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/uploads/companies_zug_switzerland.xlsx');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        const wb  = XLSX.read(buf, { type: 'array' });
        const raw = XLSX.utils.sheet_to_json<CompanyRecord>(
          wb.Sheets[wb.SheetNames[0]],
          { raw: true, defval: '' },
        );
        setCompanies(
          raw
            .filter(c => c['Company Name'])
            .map(c => ({ ...c, _sourceFile: 'Zug, Switzerland' })),
        );
      } catch (e) {
        console.error('useLoadCompanies:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { companies, loading };
};
