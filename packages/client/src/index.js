import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login'
import Authenticate from './components/Authenticate'
import Home from './components/Home'
import Error from './components/Error'
import server from './api/mock/mockApi'
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// disable http interception in prod environments
if (process.env.NODE_ENV === 'production') server.shutdown()

root.render(
  <Container fluid className="root-container m-0 p-0">
    <Row className="m-0 p-0">
      <Col className="m-0 p-0 d-none d-md-block gutter" xs={0} md={2} lg={3}></Col>
      <Col xs={12} md={8} lg={6} className='m-0 p-0'>
        <div id='main'>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<Login />} />
              <Route path="/authenticate" element={<Authenticate />} />
              <Route path="/home" element={<Home />} />
              <Route path="/error" element={<Error />} />
            </Routes>
          </BrowserRouter>
        </div>
      </Col>
      <Col className="m-0 p-0 d-none d-md-block gutter" xs={0} md={2} lg={3}></Col>
    </Row>
  </Container>
);