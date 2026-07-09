import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./lib/supabaseClient.js";
import Auth from "./Auth.jsx";

/* ============ constants ============ */
const GRADES = ['A','B','C','D','F'];
const GRADE_POINTS = {'A':4.0,'B':3.0,'C':2.0,'D':1.0,'F':0.0};

function uid(){ return crypto.randomUUID(); }

function defaultGroups(){
  return [
    {id: uid(), label:'Major requirements', type:'major', creditsRequired:60},
    {id: uid(), label:'General education', type:'gen-ed', creditsRequired:42},
    {id: uid(), label:'Electives', type:'elective', creditsRequired:18}
  ];
}

/* ============ pure calculations ============ */
function gpaOf(courses){
  const graded = courses.filter(c => c.grade && GRADE_POINTS[c.grade] !== undefined);
  const totalCredits = graded.reduce((s,c) => s + Number(c.credits||0), 0);
  if(totalCredits <= 0) return null;
  const points = graded.reduce((s,c) => s + GRADE_POINTS[c.grade]*Number(c.credits||0), 0);
  return points/totalCredits;
}
function fmtGPA(g){ return g==null ? '—' : g.toFixed(2); }
function tierFor(gpa, minGPA){
  if(gpa==null) return null;
  const buf = gpa - Number(minGPA);
  if(buf < 0.15) return 'bad';
  if(buf < 0.35) return 'okay';
  return 'good';
}
function tierLabel(t){
  if(t==='good') return 'On track';
  if(t==='okay') return 'Watch';
  if(t==='bad') return 'At risk';
  return 'No data';
}

/* ============ tiny inline icons ============ */
function IconDashboard(props){
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" {...props}>
    <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="11" y="11" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/>
  </svg>;
}
function IconCourses(props){
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M3 4.5C3 3.7 3.7 3 4.5 3H9.5V17H4.5C3.7 17 3 16.3 3 15.5V4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M17 4.5C17 3.7 16.3 3 15.5 3H10.5V17H15.5C16.3 17 17 16.3 17 15.5V4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>;
}
function IconRequirements(props){
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" {...props}>
    <circle cx="5" cy="5.5" r="1.6" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9 5.5H17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="5" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9 10H17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M3.6 14.6L4.6 15.6L6.4 13.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 14.5H17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>;
}
function IconScholarships(props){
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" {...props}>
    <circle cx="10" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7.2 10.5L6 17L10 15L14 17L12.8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>;
}
function IconWhatIf(props){
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M3 10H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M7 10C7 6.5 9 5 12 5H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M13.2 2.5L16.5 5L13.2 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10C7 13.5 9 15 12 15H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M13.2 12.5L16.5 15L13.2 17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function IconTrash(props){
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M4 6H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7.5 6V4.5C7.5 3.7 8.2 3 9 3H11C11.8 3 12.5 3.7 12.5 4.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.5 6L6.2 16C6.2 16.6 6.7 17 7.3 17H12.7C13.3 17 13.8 16.6 13.8 16L14.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}


/* ============ shared bits ============ */
function StatusPill({ tier, label }){
  const cls = tier || 'neutral';
  return <span className={`al-pill al-pill-${cls}`}><span className="al-pill-dot" />{label}</span>;
}

function ProgressBar({ label, earned, required }){
  const pct = required > 0 ? Math.min(100, (earned/required)*100) : 0;
  const remaining = Math.max(0, required-earned);
  return (
    <div className="al-progress-item">
      <div className="al-progress-top">
        <span className="al-progress-label">{label}</span>
        <span className="al-progress-nums">{earned} / {required} cr &middot; {remaining} remaining</span>
      </div>
      <div className="al-ruler">
        <div className="al-ruler-fill" style={{ width: pct.toFixed(1)+'%' }} />
      </div>
    </div>
  );
}

function Sparkline({ points }){
  if(points.length < 2) return null;
  const w=560, h=56, pad=6, max=4.0, min=0.0;
  const stepX = (w-pad*2)/(points.length-1);
  const coords = points.map((v,i) => {
    const x = pad + stepX*i;
    const y = h-pad - ((v-min)/(max-min))*(h-pad*2);
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  return (
    <div className="al-spark-wrap">
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={coords} fill="none" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <div className="al-note">GPA trend across semesters</div>
    </div>
  );
}

function EmptyState({ headline, body }){
  return <div className="al-empty"><div className="al-empty-head">{headline}</div>{body}</div>;
}

/* ============ Add-forms (own local draft state) ============ */
function AddSemesterForm({ onAdd }){
  const [name, setName] = useState('');
  return (
    <div className="al-form-row al-form-2">
      <input type="text" placeholder="e.g. Fall 2026" value={name} onChange={e=>setName(e.target.value)} />
      <button className="al-btn" onClick={() => { onAdd(name.trim()); setName(''); }}>Add semester</button>
    </div>
  );
}

function AddCourseForm({ groups, onAdd }){
  const [draft, setDraft] = useState({ name:'', credits:3, grade:'', groupId: groups[0]?.id || '' });
  function set(field, value){ setDraft(d => ({...d, [field]: value})); }
  return (
    <div className="al-form-row al-form-5">
      <input type="text" placeholder="Course name" value={draft.name} onChange={e=>set('name', e.target.value)} />
      <input type="number" min="0" step="1" placeholder="Credits" value={draft.credits} onChange={e=>set('credits', e.target.value)} />
      <select value={draft.grade} onChange={e=>set('grade', e.target.value)}>
        <option value="">In progress</option>
        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <select value={draft.groupId} onChange={e=>set('groupId', e.target.value)}>
        {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
      </select>
      <button className="al-btn" onClick={() => {
        if(!draft.name.trim()) return;
        onAdd({ name: draft.name.trim(), credits: Number(draft.credits||0), grade: draft.grade, groupId: draft.groupId });
        setDraft({ name:'', credits:3, grade:'', groupId: groups[0]?.id || '' });
      }}>Add course</button>
    </div>
  );
}

function AddGroupForm({ onAdd }){
  const [draft, setDraft] = useState({ label:'', type:'major', creditsRequired:'' });
  function set(field, value){ setDraft(d => ({...d, [field]: value})); }
  return (
    <div className="al-form-row al-form-4">
      <input type="text" placeholder="e.g. Math minor" value={draft.label} onChange={e=>set('label', e.target.value)} />
      <select value={draft.type} onChange={e=>set('type', e.target.value)}>
        {['major','minor','gen-ed','elective'].map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <input type="number" min="0" step="1" placeholder="Credits required" value={draft.creditsRequired} onChange={e=>set('creditsRequired', e.target.value)} />
      <button className="al-btn" onClick={() => {
        if(!draft.label.trim()) return;
        onAdd({ label: draft.label.trim(), type: draft.type, creditsRequired: Number(draft.creditsRequired||0) });
        setDraft({ label:'', type:'major', creditsRequired:'' });
      }}>Add group</button>
    </div>
  );
}

function AddScholarshipForm({ onAdd }){
  const [draft, setDraft] = useState({ name:'', minGPA:'', minCredits:'', notes:'' });
  function set(field, value){ setDraft(d => ({...d, [field]: value})); }
  return (
    <div className="al-form-row al-form-5">
      <input type="text" placeholder="Scholarship name" value={draft.name} onChange={e=>set('name', e.target.value)} />
      <input type="number" step="0.01" min="0" max="4" placeholder="Min GPA" value={draft.minGPA} onChange={e=>set('minGPA', e.target.value)} />
      <input type="number" step="1" min="0" placeholder="Min credits/semester" value={draft.minCredits} onChange={e=>set('minCredits', e.target.value)} />
      <input type="text" placeholder="Other conditions (optional)" value={draft.notes} onChange={e=>set('notes', e.target.value)} />
      <button className="al-btn" onClick={() => {
        if(!draft.name.trim()) return;
        onAdd({ name: draft.name.trim(), minGPA: Number(draft.minGPA||0), minCredits: Number(draft.minCredits||0), notes: draft.notes.trim() });
        setDraft({ name:'', minGPA:'', minCredits:'', notes:'' });
      }}>Add</button>
    </div>
  );
}

/* ============ Sidebar / Top status ============ */
const NAV_ITEMS = [
  { id:'dashboard', label:'Dashboard', Icon:IconDashboard },
  { id:'courses', label:'Courses', Icon:IconCourses },
  { id:'requirements', label:'Requirements', Icon:IconRequirements },
  { id:'scholarships', label:'Scholarships', Icon:IconScholarships },
  { id:'whatif', label:'What-if', Icon:IconWhatIf },
];

function Sidebar({ activeTab, setActiveTab, onSignOut, userEmail }){
  return (
    <nav className="al-sidebar">
      {NAV_ITEMS.map(item => {
        const Icon = item.Icon;
        const active = activeTab === item.id;
        return (
          <div key={item.id} className={`al-nav-item${active ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <span className="al-nav-dot" />
            <Icon />
            <span>{item.label}</span>
          </div>
        );
      })}
      <div className="al-sidebar-spacer" />
      <div className="al-sidebar-account">
        {userEmail && <div className="al-sidebar-email" title={userEmail}>{userEmail}</div>}
        <button className="al-btn-ghost al-signout-btn" onClick={onSignOut}>Sign out</button>
      </div>
    </nav>
  );
}

function TopStatus({ cumulativeGPA, semesterCount, creditsCompleted, creditsRequired, scholarshipCount, overallTier }){
  return (
    <header className="al-top">
      <div className="al-top-left">
        <div className="al-brand">
          <img src="/mavtrack-logo.png" alt="MavTrack" className="al-brand-wordmark" />
        </div>
        <div className="al-top-stats">
          <div className="al-stat"><b>{semesterCount}</b><span>Semesters</span></div>
          <div className="al-stat"><b>{creditsCompleted} / {creditsRequired}</b><span>Credits</span></div>
          <div className="al-stat"><b>{scholarshipCount}</b><span>Scholarships</span></div>
        </div>
      </div>
      <div className="al-top-right">
        {scholarshipCount > 0 && <StatusPill tier={overallTier} label={tierLabel(overallTier)} />}
        <div className="al-gpa-block">
          <div className="al-gpa-num">{fmtGPA(cumulativeGPA)}</div>
          <div className="al-gpa-label">Cumulative GPA</div>
        </div>
      </div>
    </header>
  );
}

/* ============ Views ============ */
function DashboardView({ groups, earnedByGroup, semesters, scholarshipTiers, gpaSeries }){
  if(semesters.length === 0){
    return (
      <section>
        <h2 className="al-h2">Dashboard</h2>
        <p className="al-sub">Everything that matters, pulled into one place.</p>
        <EmptyState headline="Your ledger is blank." body="Log your first semester on the Courses tab to see your GPA and progress here." />
      </section>
    );
  }
  return (
    <section>
      <h2 className="al-h2">Dashboard</h2>
      <p className="al-sub">Everything that matters, pulled into one place.</p>

      <h3 className="al-h3">Progress toward graduation</h3>
      {groups.map(g => (
        <ProgressBar key={g.id} label={g.label} earned={earnedByGroup[g.id] || 0} required={Number(g.creditsRequired||0)} />
      ))}

      <Sparkline points={gpaSeries} />

      {scholarshipTiers.length > 0 && (
        <>
          <h3 className="al-h3" style={{marginTop:28}}>Scholarship standing</h3>
          <div className="al-stamp-row">
            {scholarshipTiers.map(s => (
              <div key={s.id} className="al-stamp-card">
                <div className="al-stamp-top">
                  <div>
                    <p className="al-stamp-name">{s.name}</p>
                    <p className="al-stamp-req">Min GPA {Number(s.minGPA).toFixed(2)} &middot; {Number(s.minCredits||0)} cr/semester</p>
                  </div>
                  <StatusPill tier={s.tier} label={tierLabel(s.tier)} />
                </div>
                {s.notes && <div className="al-stamp-detail">{s.notes}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CoursesView({ semesters, groups, onAddSemester, onRenameSemester, onDeleteSemester, onAddCourse, onUpdateCourse, onDeleteCourse }){
  return (
    <section>
      <h2 className="al-h2">Courses</h2>
      <p className="al-sub">Log each semester by hand — nothing here is pulled automatically from any university system.</p>

      <AddSemesterForm onAdd={onAddSemester} />

      {semesters.length === 0 && (
        <EmptyState headline="No semesters yet." body="Add your first one above to start logging courses." />
      )}

      {semesters.map(sem => {
        const g = gpaOf(sem.courses);
        return (
          <div key={sem.id} className="al-semester">
            <div className="al-semester-head">
              <input type="text" className="al-semester-name" value={sem.name} onChange={e => onRenameSemester(sem.id, e.target.value)} />
              <div className="al-semester-meta">
                <span>Semester GPA {fmtGPA(g)}</span>
                <button className="al-btn-danger" onClick={() => onDeleteSemester(sem.id)}>Remove semester</button>
              </div>
            </div>
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr><th>Course</th><th>Credits</th><th>Grade</th><th>Counts toward</th><th /></tr>
                </thead>
                <tbody>
                  {sem.courses.map(c => (
                    <tr key={c.id}>
                      <td><input type="text" value={c.name} onChange={e => onUpdateCourse(sem.id, c.id, 'name', e.target.value)} /></td>
                      <td><input type="number" min="0" step="1" value={c.credits} onChange={e => onUpdateCourse(sem.id, c.id, 'credits', e.target.value)} /></td>
                      <td>
                        <select value={c.grade} onChange={e => onUpdateCourse(sem.id, c.id, 'grade', e.target.value)}>
                          <option value="">In progress</option>
                          {GRADES.map(gr => <option key={gr} value={gr}>{gr}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={c.groupId} onChange={e => onUpdateCourse(sem.id, c.id, 'groupId', e.target.value)}>
                          {groups.map(gg => <option key={gg.id} value={gg.id}>{gg.label}</option>)}
                        </select>
                      </td>
                      <td className="al-col-del"><button className="al-icon-btn" aria-label="Remove course" onClick={() => onDeleteCourse(sem.id, c.id)}><IconTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="al-semester-add">
              <AddCourseForm groups={groups} onAdd={course => onAddCourse(sem.id, course)} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function RequirementsView({ groups, onAddGroup, onUpdateGroup, onDeleteGroup }){
  return (
    <section>
      <h2 className="al-h2">Requirement groups</h2>
      <p className="al-sub">These define what counts toward graduation. Add one entry per major, minor, or gen-ed bucket — this is what makes double majors and minors possible later, without changing anything else.</p>

      <div className="al-row-list">
        {groups.map(g => (
          <div key={g.id} className="al-list-item">
            <input type="text" value={g.label} onChange={e => onUpdateGroup(g.id, 'label', e.target.value)} />
            <select value={g.type} onChange={e => onUpdateGroup(g.id, 'type', e.target.value)}>
              {['major','minor','gen-ed','elective'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" min="0" step="1" value={g.creditsRequired} onChange={e => onUpdateGroup(g.id, 'creditsRequired', e.target.value)} />
            <button className="al-btn-danger" onClick={() => onDeleteGroup(g.id)}>Remove</button>
          </div>
        ))}
      </div>

      <AddGroupForm onAdd={onAddGroup} />
    </section>
  );
}

function ScholarshipsView({ scholarships, onAddScholarship, onUpdateScholarship, onDeleteScholarship }){
  return (
    <section>
      <h2 className="al-h2">Scholarships</h2>
      <p className="al-sub">Enter the actual conditions from your award letter. Standing is judged with a buffer above the minimum, not a flat pass/fail — a GPA that barely clears the line still gets flagged.</p>

      {scholarships.length > 0 && (
        <div className="al-row-list">
          {scholarships.map(s => (
            <div key={s.id} className="al-list-item">
              <input type="text" value={s.name} onChange={e => onUpdateScholarship(s.id, 'name', e.target.value)} placeholder="Scholarship name" />
              <input type="number" step="0.01" min="0" max="4" value={s.minGPA} onChange={e => onUpdateScholarship(s.id, 'minGPA', e.target.value)} placeholder="Min GPA" />
              <input type="number" step="1" min="0" value={s.minCredits} onChange={e => onUpdateScholarship(s.id, 'minCredits', e.target.value)} placeholder="Min credits/semester" />
              <input type="text" value={s.notes||''} onChange={e => onUpdateScholarship(s.id, 'notes', e.target.value)} placeholder="Other conditions (optional)" />
              <button className="al-btn-danger" onClick={() => onDeleteScholarship(s.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <AddScholarshipForm onAdd={onAddScholarship} />
    </section>
  );
}

function WhatIfView({ whatIf, groups, currentGPA, projectedGPA, scholarshipTiers, onAddCourse, onUpdateCourse, onDeleteCourse, onRename, onReset }){
  const delta = (currentGPA != null && projectedGPA != null) ? (projectedGPA - currentGPA) : null;
  return (
    <section>
      <h2 className="al-h2">What-if</h2>
      <p className="al-sub">Build a hypothetical semester to see how it would move your GPA, without touching your real record.</p>
      <div className="al-banner">This semester is hypothetical — it is never saved as part of your real history.</div>

      <div className="al-form-row al-form-2">
        <input type="text" value={whatIf.name} onChange={e => onRename(e.target.value)} />
        <button className="al-btn-ghost" onClick={onReset}>Clear hypothetical</button>
      </div>

      <div className="al-table-wrap">
        <table className="al-table">
          <thead><tr><th>Course</th><th>Credits</th><th>Estimated grade</th><th>Counts toward</th><th /></tr></thead>
          <tbody>
            {whatIf.courses.map(c => (
              <tr key={c.id}>
                <td><input type="text" value={c.name} onChange={e => onUpdateCourse(c.id, 'name', e.target.value)} /></td>
                <td><input type="number" min="0" step="1" value={c.credits} onChange={e => onUpdateCourse(c.id, 'credits', e.target.value)} /></td>
                <td>
                  <select value={c.grade} onChange={e => onUpdateCourse(c.id, 'grade', e.target.value)}>
                    <option value="">In progress</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </td>
                <td>
                  <select value={c.groupId} onChange={e => onUpdateCourse(c.id, 'groupId', e.target.value)}>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </td>
                <td className="al-col-del"><button className="al-icon-btn" aria-label="Remove course" onClick={() => onDeleteCourse(c.id)}><IconTrash /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="al-semester-add">
        <AddCourseForm groups={groups} onAdd={onAddCourse} />
      </div>

      <div className="al-split">
        <div className="al-delta-box">
          <div className="al-delta-lbl">Current cumulative GPA</div>
          <div className="al-delta-val">{fmtGPA(currentGPA)}</div>
        </div>
        <div className="al-delta-box">
          <div className="al-delta-lbl">Projected GPA</div>
          <div className="al-delta-val">
            {fmtGPA(projectedGPA)}
            {delta != null && <span className="al-delta-diff"> ({delta >= 0 ? '+' : ''}{delta.toFixed(2)})</span>}
          </div>
        </div>
      </div>

      {scholarshipTiers.length > 0 && projectedGPA != null && (
        <>
          <h3 className="al-h3" style={{marginTop:24}}>If this semester happens</h3>
          <div className="al-stamp-row">
            {scholarshipTiers.map(s => (
              <div key={s.id} className="al-stamp-card">
                <div className="al-stamp-top">
                  <div>
                    <p className="al-stamp-name">{s.name}</p>
                    <p className="al-stamp-req">Min GPA {Number(s.minGPA).toFixed(2)}</p>
                  </div>
                  <StatusPill tier={s.tier} label={tierLabel(s.tier)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ============ CSS ============ */
const CSS = `
:root{
  --bg:#0B0E12;
  --bg-panel:#12161C;
  --bg-elevated:#171C24;
  --line:#232A33;
  --line-soft:#1B2129;
  --text:#E7E9EA;
  --text-dim:#8B94A0;
  --text-faint:#5C6570;
  --accent:#E8A33D;
  --accent-glow:rgba(232,163,61,0.35);
  --good:#4ADE80;
  --okay:#FBBF24;
  --bad:#F87171;
  --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,'SF Mono',Consolas,'Courier New',monospace;
}
.al-root{ min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--sans); position:relative; }
.al-bg{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; background:var(--bg); }
.al-bg::before{
  content:""; position:absolute; inset:-20%;
  background-image:
    linear-gradient(var(--line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-soft) 1px, transparent 1px);
  background-size:46px 46px;
  animation: al-grid-drift 46s linear infinite;
  opacity:.55;
}
.al-bg::after{
  content:""; position:absolute; width:52vw; height:52vw; border-radius:50%;
  background:radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  top:-8%; left:-8%; filter:blur(70px); opacity:.5;
  animation: al-glow-move 24s ease-in-out infinite;
}
@keyframes al-grid-drift{ from{ background-position:0 0; } to{ background-position:92px 92px; } }
@keyframes al-glow-move{ 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(18%,14%); } }
@media (prefers-reduced-motion: reduce){
  .al-bg::before, .al-bg::after{ animation:none; }
}

.al-top{
  position:sticky; top:0; z-index:2;
  display:flex; align-items:center; justify-content:space-between; gap:24px;
  padding:16px 28px; border-bottom:1px solid var(--line);
  background:rgba(11,14,18,.78); backdrop-filter:blur(10px);
}
.al-eyebrow{ font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--text-faint); margin:0 0 8px; }
.al-brand{ display:flex; align-items:center; margin:0 0 10px; }
.al-brand-wordmark{ height:18px; width:auto; display:block; }
.al-top-stats{ display:flex; gap:24px; }
.al-stat{ display:flex; flex-direction:column; }
.al-stat b{ font-family:var(--mono); font-size:14px; color:var(--text); }
.al-stat span{ font-size:11px; color:var(--text-faint); margin-top:2px; }
.al-top-right{ display:flex; align-items:center; gap:20px; }
.al-gpa-block{ text-align:right; }
.al-gpa-num{ font-family:var(--mono); font-size:32px; font-weight:700; line-height:1; color:var(--text); }
.al-gpa-label{ font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--text-faint); margin-top:4px; }

.al-body{ position:relative; z-index:1; display:flex; min-height:calc(100vh - 78px); }
.al-sidebar{ width:196px; flex:0 0 196px; padding:20px 12px; border-right:1px solid var(--line); display:flex; flex-direction:column; gap:2px; }
.al-sidebar-spacer{ flex:1; }
.al-sidebar-account{ border-top:1px solid var(--line); padding-top:12px; margin-top:12px; display:flex; flex-direction:column; gap:8px; }
.al-sidebar-email{ font-family:var(--mono); font-size:11px; color:var(--text-faint); padding:0 10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.al-signout-btn{ width:100%; text-align:center; }
.al-nav-item{ display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:7px; color:var(--text-dim); cursor:pointer; font-size:13px; font-weight:600; }
.al-nav-item:hover{ background:var(--bg-elevated); color:var(--text); }
.al-nav-item.active{ background:var(--bg-elevated); color:var(--accent); }
.al-nav-dot{ width:5px; height:5px; border-radius:50%; background:var(--text-faint); flex:0 0 auto; }
.al-nav-item.active .al-nav-dot{ background:var(--accent); box-shadow:0 0 6px var(--accent-glow); }
.al-main{ flex:1; padding:32px 36px 80px; max-width:880px; }

@media (max-width:820px){
  .al-body{ flex-direction:column; }
  .al-sidebar{ width:100%; flex-direction:row; overflow-x:auto; border-right:none; border-bottom:1px solid var(--line); padding:10px 12px; }
  .al-main{ padding:20px; }
  .al-top{ flex-wrap:wrap; gap:14px; }
  .al-sidebar-spacer{ display:none; }
  .al-sidebar-account{ border-top:none; border-left:1px solid var(--line); margin-top:0; padding-top:0; padding-left:12px; flex-direction:row; align-items:center; flex:0 0 auto; }
  .al-sidebar-email{ display:none; }
  .al-signout-btn{ white-space:nowrap; }
}

.al-h2{ font-size:17px; font-weight:700; margin:0 0 4px; color:var(--text); }
.al-h3{ font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--text-dim); margin:0 0 12px; }
.al-sub{ color:var(--text-faint); font-size:13px; margin:0 0 22px; }

.al-empty{ text-align:center; padding:48px 20px; color:var(--text-faint); border:1px dashed var(--line); border-radius:10px; }
.al-empty-head{ font-size:15px; font-weight:600; color:var(--text); margin-bottom:6px; }

.al-progress-item{ margin-bottom:18px; }
.al-progress-top{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px; }
.al-progress-label{ font-size:13px; font-weight:600; color:var(--text); }
.al-progress-nums{ font-family:var(--mono); font-size:11px; color:var(--text-faint); }
.al-ruler{ height:8px; background:var(--bg-elevated); border:1px solid var(--line); border-radius:5px; overflow:hidden; }
.al-ruler-fill{ height:100%; background:var(--accent); box-shadow:0 0 8px var(--accent-glow); }

.al-spark-wrap{ margin-top:16px; padding:14px; border:1px solid var(--line); border-radius:8px; background:var(--bg-panel); }
.al-note{ font-size:11px; color:var(--text-faint); margin-top:6px; }

.al-pill{ display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-size:11px; font-weight:700; font-family:var(--mono); border:1px solid var(--line); color:var(--text-dim); white-space:nowrap; }
.al-pill-dot{ width:6px; height:6px; border-radius:50%; background:var(--text-faint); }
.al-pill-good{ color:var(--good); border-color:rgba(74,222,128,.3); background:rgba(74,222,128,.08); }
.al-pill-good .al-pill-dot{ background:var(--good); box-shadow:0 0 6px var(--good); }
.al-pill-okay{ color:var(--okay); border-color:rgba(251,191,36,.3); background:rgba(251,191,36,.08); }
.al-pill-okay .al-pill-dot{ background:var(--okay); box-shadow:0 0 6px var(--okay); }
.al-pill-bad{ color:var(--bad); border-color:rgba(248,113,113,.3); background:rgba(248,113,113,.08); }
.al-pill-bad .al-pill-dot{ background:var(--bad); box-shadow:0 0 6px var(--bad); }

.al-stamp-row{ display:flex; flex-wrap:wrap; gap:14px; }
.al-stamp-card{ border:1px solid var(--line); background:var(--bg-panel); border-radius:9px; padding:14px 16px; flex:1; min-width:220px; }
.al-stamp-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.al-stamp-name{ font-size:13px; font-weight:700; margin:0 0 2px; color:var(--text); }
.al-stamp-req{ font-family:var(--mono); font-size:11px; color:var(--text-faint); margin:0; }
.al-stamp-detail{ font-size:11px; color:var(--text-dim); margin-top:10px; font-style:italic; }

.al-form-row{ display:grid; gap:10px; margin-bottom:16px; }
.al-form-2{ grid-template-columns:2fr auto; }
.al-form-4{ grid-template-columns:2fr 1fr 1fr auto; }
.al-form-5{ grid-template-columns:2fr 1fr 1fr 1fr auto; }
@media (max-width:820px){ .al-form-2,.al-form-4,.al-form-5{ grid-template-columns:1fr; } }

input[type=text], input[type=number], select{
  font-family:var(--sans); font-size:13px; padding:8px 10px; border:1px solid var(--line);
  border-radius:6px; background:var(--bg-panel); color:var(--text); width:100%;
}
input[type=number]{ font-family:var(--mono); }
input:focus, select:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-glow); }
input::placeholder{ color:var(--text-faint); }

.al-btn{ font-family:var(--sans); font-size:12px; font-weight:700; padding:8px 14px; border:1px solid var(--accent); border-radius:6px; background:var(--accent); color:#151008; cursor:pointer; }
.al-btn:hover{ filter:brightness(1.08); }
.al-btn-ghost{ font-family:var(--sans); font-size:12px; font-weight:700; padding:8px 14px; border:1px solid var(--line); border-radius:6px; background:transparent; color:var(--text-dim); cursor:pointer; }
.al-btn-ghost:hover{ background:var(--bg-elevated); color:var(--text); }
.al-btn-danger{ font-family:var(--sans); font-size:11px; font-weight:700; padding:6px 10px; border:1px solid var(--bad); border-radius:6px; background:transparent; color:var(--bad); cursor:pointer; white-space:nowrap; }
.al-btn-danger:hover{ background:rgba(248,113,113,.1); }
.al-icon-btn{ border:1px solid var(--line); background:transparent; color:var(--text-faint); border-radius:6px; padding:6px; cursor:pointer; display:inline-flex; }
.al-icon-btn:hover{ color:var(--bad); border-color:var(--bad); }

.al-semester{ border:1px solid var(--line); border-radius:9px; margin-bottom:18px; overflow:hidden; background:var(--bg-panel); }
.al-semester-head{ display:flex; justify-content:space-between; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid var(--line); flex-wrap:wrap; }
.al-semester-name{ font-size:14px; font-weight:700; background:transparent; border:none; max-width:240px; padding:4px 2px; }
.al-semester-meta{ display:flex; align-items:center; gap:12px; font-family:var(--mono); font-size:12px; color:var(--text-faint); }
.al-semester-add{ padding:12px 14px 14px; }

.al-table-wrap{ overflow-x:auto; }
.al-table{ width:100%; border-collapse:collapse; min-width:560px; }
.al-table th{ text-align:left; font-family:var(--mono); font-size:10px; text-transform:uppercase; letter-spacing:.05em; color:var(--text-faint); padding:9px 12px; border-bottom:1px solid var(--line); }
.al-table td{ padding:7px 12px; border-bottom:1px solid var(--line-soft); vertical-align:middle; }
.al-table tr:last-child td{ border-bottom:none; }
.al-table input, .al-table select{ padding:6px 8px; font-size:12px; }
.al-col-del{ width:1%; text-align:right; }

.al-row-list{ display:flex; flex-direction:column; gap:10px; margin-bottom:18px; }
.al-list-item{ display:flex; align-items:center; gap:10px; border:1px solid var(--line); background:var(--bg-panel); border-radius:8px; padding:10px 12px; }
.al-list-item > *{ flex:1; }
.al-list-item button{ flex:0 0 auto; }

.al-banner{ font-family:var(--mono); font-size:12px; padding:9px 12px; border-radius:7px; margin-bottom:18px; border:1px solid var(--accent); color:var(--accent); background:rgba(232,163,61,.08); }

.al-split{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:22px; }
@media (max-width:820px){ .al-split{ grid-template-columns:1fr; } }
.al-delta-box{ border:1px solid var(--line); background:var(--bg-panel); border-radius:9px; padding:16px; text-align:center; }
.al-delta-lbl{ font-family:var(--mono); font-size:10px; text-transform:uppercase; color:var(--text-faint); letter-spacing:.06em; }
.al-delta-val{ font-family:var(--mono); font-size:24px; font-weight:700; margin-top:6px; color:var(--text); }
.al-delta-diff{ font-size:13px; color:var(--text-faint); }
.al-footer{ position:relative; z-index:1; text-align:center; padding:22px 20px 30px; font-size:11px; color:var(--text-faint); border-top:1px solid var(--line); font-family:var(--mono); }
.al-footer-links{ display:flex; justify-content:center; gap:16px; margin-bottom:10px; }
.al-footer-link{ color:var(--text-dim); text-decoration:none; font-family:var(--mono); font-size:11px; letter-spacing:.02em; }
.al-footer-link:hover{ color:var(--accent); }
.al-sync-error{ position:fixed; top:14px; left:50%; transform:translateX(-50%); z-index:50; background:var(--bad); color:#2A0D0D; font-family:var(--mono); font-size:12px; font-weight:700; padding:9px 16px; border-radius:8px; cursor:pointer; box-shadow:0 6px 20px rgba(0,0,0,.4); max-width:90vw; text-align:center; }
`;

/* ============ Supabase row <-> local state field mapping ============ */
function groupFromRow(row){
  return { id: row.id, label: row.label, type: row.type, creditsRequired: Number(row.credits_required||0) };
}
function groupToInsertRow(g, userId){
  return { id: g.id, user_id: userId, label: g.label, type: g.type, credits_required: Number(g.creditsRequired||0) };
}
function courseFromRow(row){
  return { id: row.id, name: row.name, credits: Number(row.credits||0), grade: row.grade || '', groupId: row.group_id || '' };
}
function scholarshipFromRow(row){
  return { id: row.id, name: row.name, minGPA: Number(row.min_gpa||0), minCredits: Number(row.min_credits||0), notes: row.notes || '' };
}

const LOADING_CSS = `
:root{ --bg:#0B0E12; --text:#E7E9EA; --text-faint:#5C6570; --mono:ui-monospace,SFMono-Regular,'SF Mono',Consolas,'Courier New',monospace; }
.al-loading-screen{ min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); color:var(--text-faint); font-family:var(--mono); font-size:13px; letter-spacing:.04em; }
`;

/* ============ main app ============ */
export default function App(){
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const [groups, setGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [whatIf, setWhatIf] = useState({ name:'Next semester', courses:[] });
  const [activeTab, setActiveTab] = useState('dashboard');

  /* ---- track auth session ---- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if(!newSession){
        setGroups([]); setSemesters([]); setScholarships([]);
        setWhatIf({ name:'Next semester', courses:[] });
        setDataLoaded(false);
      }
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  /* ---- load this user's data once signed in ---- */
  useEffect(() => {
    if(!session) return;
    let cancelled = false;
    async function loadData(){
      try{
        const userId = session.user.id;

        let { data: groupRows, error: gErr } = await supabase
          .from('requirement_groups').select('*').order('created_at', { ascending: true });
        if(gErr) throw gErr;

        if(!groupRows || groupRows.length === 0){
          const seed = defaultGroups().map(g => groupToInsertRow(g, userId));
          const { data: inserted, error: seedErr } = await supabase.from('requirement_groups').insert(seed).select();
          if(seedErr) throw seedErr;
          groupRows = inserted;
        }

        const { data: semRows, error: sErr } = await supabase
          .from('semesters').select('*, courses(*)').order('created_at', { ascending: true });
        if(sErr) throw sErr;

        const { data: scholRows, error: schErr } = await supabase
          .from('scholarships').select('*').order('created_at', { ascending: true });
        if(schErr) throw schErr;

        const { data: whatIfRow, error: wErr } = await supabase
          .from('whatif_state').select('*').eq('user_id', userId).maybeSingle();
        if(wErr) throw wErr;

        if(cancelled) return;
        setGroups(groupRows.map(groupFromRow));
        setSemesters((semRows || []).map(s => ({
          id: s.id,
          name: s.name,
          courses: (s.courses || []).map(courseFromRow)
        })));
        setScholarships((scholRows || []).map(scholarshipFromRow));
        setWhatIf(whatIfRow ? { name: whatIfRow.name, courses: whatIfRow.courses || [] } : { name:'Next semester', courses:[] });
        setDataLoaded(true);
      }catch(err){
        console.error('failed to load data', err);
        if(!cancelled) setSyncError('Could not load your data. Try refreshing the page.');
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [session]);

  /* ---- what-if is a single scratch row per user; safe to blind-upsert on change ---- */
  useEffect(() => {
    if(!session || !dataLoaded) return;
    supabase.from('whatif_state').upsert({
      user_id: session.user.id, name: whatIf.name, courses: whatIf.courses, updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if(error){ console.error('whatif sync failed', error); setSyncError('Could not save your what-if changes.'); }
    });
  }, [whatIf, session, dataLoaded]);

  const allRealCourses = useMemo(() => semesters.flatMap(s => s.courses), [semesters]);
  const cumulativeGPA = useMemo(() => gpaOf(allRealCourses), [allRealCourses]);
  const totalCreditsRequired = useMemo(() => groups.reduce((s,g) => s + Number(g.creditsRequired||0), 0), [groups]);
  const totalCreditsCompleted = useMemo(() => allRealCourses.filter(c => c.grade && c.grade !== 'F').reduce((s,c) => s + Number(c.credits||0), 0), [allRealCourses]);
  const earnedByGroup = useMemo(() => {
    const map = {};
    groups.forEach(g => {
      map[g.id] = allRealCourses.filter(c => c.groupId === g.id && c.grade && c.grade !== 'F').reduce((s,c) => s + Number(c.credits||0), 0);
    });
    return map;
  }, [groups, allRealCourses]);
  const latestSemesterCredits = useMemo(() => {
    if(semesters.length === 0) return 0;
    const last = semesters[semesters.length-1];
    return last.courses.reduce((s,c) => s + Number(c.credits||0), 0);
  }, [semesters]);
  const gpaSeries = useMemo(() => semesters.map(s => gpaOf(s.courses)).filter(v => v != null), [semesters]);

  const scholarshipTiers = useMemo(() => scholarships.map(s => {
    let tier = tierFor(cumulativeGPA, s.minGPA);
    const creditsOk = semesters.length === 0 ? true : latestSemesterCredits >= Number(s.minCredits||0);
    if(tier && tier !== 'bad' && !creditsOk) tier = 'bad';
    return { ...s, tier };
  }), [scholarships, cumulativeGPA, latestSemesterCredits, semesters.length]);

  const overallTier = useMemo(() => {
    if(scholarshipTiers.length === 0) return null;
    if(scholarshipTiers.some(s => s.tier === 'bad')) return 'bad';
    if(scholarshipTiers.some(s => s.tier === 'okay')) return 'okay';
    if(scholarshipTiers.every(s => s.tier === 'good')) return 'good';
    return null;
  }, [scholarshipTiers]);

  const whatIfProjectedGPA = useMemo(() => gpaOf(allRealCourses.concat(whatIf.courses)), [allRealCourses, whatIf.courses]);
  const whatIfScholarshipTiers = useMemo(() => scholarships.map(s => ({ ...s, tier: tierFor(whatIfProjectedGPA, s.minGPA) })), [scholarships, whatIfProjectedGPA]);

  /* ---- mutation handlers: update local state immediately, sync to Supabase in the background ---- */
  function reportError(action, error){
    console.error(action, error);
    setSyncError(`Could not save that change (${action}). Check your connection.`);
  }

  function addSemester(name){
    const row = { id: uid(), name: name || `Semester ${semesters.length+1}`, courses: [] };
    setSemesters(prev => [...prev, row]);
    supabase.from('semesters').insert({ id: row.id, user_id: session.user.id, name: row.name })
      .then(({ error }) => { if(error) reportError('add semester', error); });
  }
  function renameSemester(id, name){
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    supabase.from('semesters').update({ name }).eq('id', id)
      .then(({ error }) => { if(error) reportError('rename semester', error); });
  }
  function deleteSemester(id){
    setSemesters(prev => prev.filter(s => s.id !== id));
    supabase.from('semesters').delete().eq('id', id)
      .then(({ error }) => { if(error) reportError('delete semester', error); });
  }
  function addCourse(semId, course){
    const row = { id: uid(), ...course };
    setSemesters(prev => prev.map(s => s.id === semId ? { ...s, courses: [...s.courses, row] } : s));
    supabase.from('courses').insert({
      id: row.id, user_id: session.user.id, semester_id: semId, group_id: row.groupId || null,
      name: row.name, credits: Number(row.credits||0), grade: row.grade || null
    }).then(({ error }) => { if(error) reportError('add course', error); });
  }
  function updateCourse(semId, courseId, field, value){
    const val = field === 'credits' ? Number(value||0) : value;
    setSemesters(prev => prev.map(s => s.id !== semId ? s : {
      ...s, courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: val } : c)
    }));
    const dbField = field === 'groupId' ? 'group_id' : field;
    const dbVal = (field === 'grade' && value === '') ? null : (field === 'groupId' && value === '' ? null : val);
    supabase.from('courses').update({ [dbField]: dbVal }).eq('id', courseId)
      .then(({ error }) => { if(error) reportError('update course', error); });
  }
  function deleteCourse(semId, courseId){
    setSemesters(prev => prev.map(s => s.id !== semId ? s : { ...s, courses: s.courses.filter(c => c.id !== courseId) }));
    supabase.from('courses').delete().eq('id', courseId)
      .then(({ error }) => { if(error) reportError('delete course', error); });
  }
  function addGroup(g){
    const row = { id: uid(), ...g };
    setGroups(prev => [...prev, row]);
    supabase.from('requirement_groups').insert(groupToInsertRow(row, session.user.id))
      .then(({ error }) => { if(error) reportError('add requirement group', error); });
  }
  function updateGroup(id, field, value){
    const val = field === 'creditsRequired' ? Number(value||0) : value;
    setGroups(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g));
    const dbField = field === 'creditsRequired' ? 'credits_required' : field;
    supabase.from('requirement_groups').update({ [dbField]: val }).eq('id', id)
      .then(({ error }) => { if(error) reportError('update requirement group', error); });
  }
  function deleteGroup(id){
    setGroups(prev => prev.filter(g => g.id !== id));
    supabase.from('requirement_groups').delete().eq('id', id)
      .then(({ error }) => { if(error) reportError('delete requirement group', error); });
  }

  function addScholarship(s){
    const row = { id: uid(), ...s };
    setScholarships(prev => [...prev, row]);
    supabase.from('scholarships').insert({
      id: row.id, user_id: session.user.id, name: row.name,
      min_gpa: Number(row.minGPA||0), min_credits: Number(row.minCredits||0), notes: row.notes || ''
    }).then(({ error }) => { if(error) reportError('add scholarship', error); });
  }
  function updateScholarship(id, field, value){
    const val = (field==='minGPA'||field==='minCredits') ? Number(value||0) : value;
    setScholarships(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
    const dbField = field === 'minGPA' ? 'min_gpa' : field === 'minCredits' ? 'min_credits' : field;
    supabase.from('scholarships').update({ [dbField]: val }).eq('id', id)
      .then(({ error }) => { if(error) reportError('update scholarship', error); });
  }
  function deleteScholarship(id){
    setScholarships(prev => prev.filter(s => s.id !== id));
    supabase.from('scholarships').delete().eq('id', id)
      .then(({ error }) => { if(error) reportError('delete scholarship', error); });
  }

  /* what-if courses stay local-only per keystroke; the effect above persists the whole blob */
  function addWhatIfCourse(course){ setWhatIf(prev => ({ ...prev, courses: [...prev.courses, { id: uid(), ...course }] })); }
  function updateWhatIfCourse(courseId, field, value){
    setWhatIf(prev => ({ ...prev, courses: prev.courses.map(c => c.id === courseId ? { ...c, [field]: field === 'credits' ? Number(value||0) : value } : c) }));
  }
  function deleteWhatIfCourse(courseId){ setWhatIf(prev => ({ ...prev, courses: prev.courses.filter(c => c.id !== courseId) })); }
  function renameWhatIf(name){ setWhatIf(prev => ({ ...prev, name })); }
  function resetWhatIf(){ setWhatIf({ name:'Next semester', courses:[] }); }

  async function handleSignOut(){
    await supabase.auth.signOut();
  }

  if(!authChecked){
    return <div className="al-loading-screen"><style>{LOADING_CSS}</style>Loading…</div>;
  }
  if(!session){
    return <Auth />;
  }
  if(!dataLoaded){
    return <div className="al-loading-screen"><style>{LOADING_CSS}</style>Loading your data…</div>;
  }

  return (
    <div className="al-root">
      <style>{CSS}</style>
      <div className="al-bg" />
      {syncError && (
        <div className="al-sync-error" onClick={() => setSyncError(null)} title="Tap to dismiss">{syncError}</div>
      )}
      <TopStatus
        cumulativeGPA={cumulativeGPA}
        semesterCount={semesters.length}
        creditsCompleted={totalCreditsCompleted}
        creditsRequired={totalCreditsRequired}
        scholarshipCount={scholarships.length}
        overallTier={overallTier}
      />
      <div className="al-body">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} userEmail={session.user.email} />
        <main className="al-main">
          {activeTab === 'dashboard' && (
            <DashboardView groups={groups} earnedByGroup={earnedByGroup} semesters={semesters} scholarshipTiers={scholarshipTiers} gpaSeries={gpaSeries} />
          )}
          {activeTab === 'courses' && (
            <CoursesView
              semesters={semesters} groups={groups}
              onAddSemester={addSemester} onRenameSemester={renameSemester} onDeleteSemester={deleteSemester}
              onAddCourse={addCourse} onUpdateCourse={updateCourse} onDeleteCourse={deleteCourse}
            />
          )}
          {activeTab === 'requirements' && (
            <RequirementsView groups={groups} onAddGroup={addGroup} onUpdateGroup={updateGroup} onDeleteGroup={deleteGroup} />
          )}
          {activeTab === 'scholarships' && (
            <ScholarshipsView scholarships={scholarships} onAddScholarship={addScholarship} onUpdateScholarship={updateScholarship} onDeleteScholarship={deleteScholarship} />
          )}
          {activeTab === 'whatif' && (
            <WhatIfView
              whatIf={whatIf} groups={groups}
              currentGPA={cumulativeGPA} projectedGPA={whatIfProjectedGPA}
              scholarshipTiers={whatIfScholarshipTiers}
              onAddCourse={addWhatIfCourse} onUpdateCourse={updateWhatIfCourse} onDeleteCourse={deleteWhatIfCourse}
              onRename={renameWhatIf} onReset={resetWhatIf}
            />
          )}
        </main>
      </div>
      <footer className="al-footer">
        <div className="al-footer-links">
          <a href="https://github.com/labob2/MavTrack" target="_blank" rel="noopener noreferrer" className="al-footer-link">GitHub</a>
          <a href="https://www.linkedin.com/in/labibalkarim/" target="_blank" rel="noopener noreferrer" className="al-footer-link">LinkedIn</a>
        </div>
        MavTrack &middot; created by Md Labib Al Karim &middot; All rights reserved &middot; Not affiliated with the University of Texas at Arlington
      </footer>
    </div>
  );
}
