import { useState } from 'react';
import './App.css';

const skills=['HTML','CSS','JavaScript','React','Node.js','Express','MongoDB','Git'];
const projects=[
  {id:1,title:'E-Commerce Store',tech:'Express, EJS, MongoDB',desc:'Shopping site with cart, payment flow and seller panel.'},
  {id:2,title:'Snake and Ladder',tech:'HTML, CSS, JavaScript',desc:'Two-player board game with dice, snakes and ladders.'},
  {id:3,title:'To-Do Manager',tech:'JavaScript',desc:'Task list with reorder, delete and completion checkbox.'}
];
function Navbar(){return <nav className="navbar"><span className="logo">Vaibhav Mishra</span><div className="links"><a href="#about">About</a><a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#contact">Contact</a></div></nav>}
function Hero(){return <header className="hero"><h1>Hi, I am <span>Vaibhav Mishra</span></h1><p>MCA Student | Full Stack Developer</p><a className="btn" href="#projects">View My Work</a></header>}
function About(){return <section id="about" className="section"><h2>About Me</h2><p>I am a Master of Computer Applications student who enjoys building web applications with the MERN stack.</p></section>}
function Skills(){return <section id="skills" className="section alt"><h2>Skills</h2><div className="skill-list">{skills.map(skill=><span key={skill} className="skill">{skill}</span>)}</div></section>}
function ProjectCard({title,tech,desc}){return <div className="project-card"><h3>{title}</h3><small>{tech}</small><p>{desc}</p></div>}
function Projects(){return <section id="projects" className="section"><h2>Projects</h2><div className="project-grid">{projects.map(p=><ProjectCard key={p.id} {...p}/>)}</div></section>}
function Contact(){
  const [form,setForm]=useState({name:'',email:'',message:''}),[sent,setSent]=useState(false);
  const handleChange=e=>setForm({...form,[e.target.name]:e.target.value});
  const handleSubmit=e=>{e.preventDefault();console.log('Form data:',form);setSent(true);setForm({name:'',email:'',message:''})};
  return <section id="contact" className="section alt"><h2>Contact Me</h2><form className="contact-form" onSubmit={handleSubmit}><input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required/><input name="email" type="email" placeholder="Your email" value={form.email} onChange={handleChange} required/><textarea name="message" rows="4" placeholder="Message" value={form.message} onChange={handleChange} required/><button className="btn" type="submit">Send Message</button>{sent&&<p className="ok">Thank you! Your message has been sent.</p>}</form></section>
}
function Footer(){return <footer className="footer">&copy; 2026 Vaibhav Mishra. Built with React.</footer>}
export default function App(){return <><Navbar/><Hero/><About/><Skills/><Projects/><Contact/><Footer/></>}
