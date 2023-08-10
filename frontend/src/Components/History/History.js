import React, { useEffect, useState } from "react";
import { withRouter } from 'react-router';
import './History.css';
import APIClient from '../../Actions/apiClient';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

import i18n from "i18next";
import Plot from 'react-plotly.js';

import { withTranslation } from 'react-i18next';

const History = () => {
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [profile, setProfile] = useState({});
  const [predictionfinished, setPredictionfinished] = useState(false);
  const [history, setHistory] = useState({})
  const [searchField, setSearchField] = useState('')
  // Translation item
  const { t } = useTranslation();

  const apiClient = new APIClient()

  // Check the users auth token,
  // If there is none / it is blacklisted,
  // Push user to login, set message banner to appropriate message,
  // Store current location to redirect user back here after successful login
  useEffect(() => {
    apiClient.getAuth().then((data) => {
      apiClient.getUserDetails(data.logged_in_as.email).then((data) => {
        console.log(data)
        setIsFetchingData(false);
        setProfile(data)
        setHistory(data.submittedJobs)
      })
    }).catch((err) => {
      if (err.response.status) {
        if (err.response.status === 401) {
          navigate("/login", {
            state: {
              from: 'History',
              message: i18n.t('messages.notauthorized')
            }
          });
        }
      }
    })

  })


  // Filter object array
  // Return item if value at specified key includes letter(s)
  // Used for searching through list of history items
  function getFilteredList(array, key, value) {
    return array.filter(function (e) {
      return e[key].includes(value);
    });
  }

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
    var filteredList = getFilteredList(profile.submittedJobs, "predictionTitle", value);
    this.setState({
      history: filteredList.reverse()
    });
  }


  // CreateTabs and CreateCols map arrays of data to return functions that generate DOM elements
  function createTabs(item) {
    return (
      <ListGroup.Item action eventKey={item._id.$oid} key={item._id.$oid}>
        {item.predictionTitle}
      </ListGroup.Item>
    )
  }

  function createCols(item) {
    let startTime = new Date(item.timeStarted.$date);
    var endTime = i18n.t('history.predictionrunning');

    if (item.timeEnded) {
      let timeEnded = new Date(item.timeEnded.$date);
      endTime = timeEnded.toLocaleTimeString() + ' ' + timeEnded.toLocaleDateString()
    }

    function range(start, stop, step) {
      var a = [start], b = start;
      while (b < stop) {
        a.push((b += step || 1) / 365);
      }
      return a;
    }

    function x_axis(nb_bins) {
      return range(0, 3498, 3498 / nb_bins);
    }

    function createPlotPatient(item) {
      if (item.result) {
        // Creating the plot for each patient
        function createPatientList(item) {
          return (
            <ListGroup.Item action eventKey={item.patient_id} key={item.patient_id}>
              {item.patient_id}
            </ListGroup.Item>
          )
        }
        var patientList = item.result.map(createPatientList);

        function createPatientPlot(item) {
          console.log('item plot', item)
          var plot_data = [];

          Object.keys(item).forEach(function (key) {
            if (key != 'patient_id') {
              if (key == 'NO') {
                var trace1 = {
                  x: x_axis(item[key].length),
                  y: item[key],
                  type: 'scatter',
                  name: key,
                  mode: 'lines',
                  line: {
                    dash: 'Solid',
                    width: 3
                  }
                }
                plot_data.push(trace1)
              } else {
                var trace1 = {
                  x: x_axis(item[key].length),
                  y: item[key],
                  type: 'scatter',
                  name: key,
                  mode: 'lines',
                  opacity: 0.5,
                  line: {
                    dash: 'dot',
                    width: 2
                  }
                }
                plot_data.push(trace1)
              }
            }
          })

          return (
            <Tab.Pane eventKey={item.patient_id} key={item.patient_id} mountOnEnter="true" unmountOnExit="false">
              <Table striped bordered hover className="prediction-plot">
                <tbody>
                  <tr> <Plot data={plot_data} layout={{
                    width: 500, height: 500,
                    title: item.patient_id,
                    xaxis: { title: i18n.t('history.plotXaxis') },
                    yaxis: { range: [0, 1], title: i18n.t('history.plotYaxis') }
                  }} />
                  </tr>
                </tbody>
              </Table>
            </Tab.Pane>
          )
        }
        var patientPlot = item.result.map(createPatientPlot);

        return (
          <div className="container">
            <div className="container-fluid">
              <Tab.Container id="list-plot" defaultActiveKey='patient_0'>
                <Row key="f">
                  <Col sm={4} id='list_group_patient'>
                    {patientList}
                  </Col>
                  <Col sm={8}>
                    <Tab.Content>
                      {patientPlot}
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </div>
          </div>
        )

      } else {
        return (
          <div> </div>
        )
      }

    }

    var res = createPlotPatient(item)


    return (
      <Tab.Pane eventKey={item._id.$oid} key={item._id.$oid} mountOnEnter="true" unmountOnExit="false">
        <Table bordered className="prediction-info" size="sm">
          <tbody>
            <tr>
              <td className="prediction-info-left" > {i18n.t('history.predictionname')}</td>
              <td> {item.predictionTitle} </td>
            </tr>
            <tr>
              <td> {i18n.t('history.predictionstarted')}</td>
              <td> {startTime.toLocaleTimeString() + ' ' + startTime.toLocaleDateString()} </td>
            </tr>
            <tr>
              <td> {i18n.t('history.predictionfinished')}</td>
              <td> {endTime} </td>
            </tr>
            <tr>

              {res}

            </tr>
          </tbody>
        </Table>
      </Tab.Pane>

    )
  }


  if (!isFetchingData) {
    var historyEntries = history;
    historyEntries = historyEntries.reverse()
    var tabs = historyEntries.map(createTabs());
    var cols = historyEntries.map(createCols());
  }

  return (
    <div className="container">
      <div className="container-fluid">

        <Tab.Container id="list-group-tabs-example" defaultActiveKey="explanation">
          <Table striped className="prediction-list">
            <Row key="Explanation">
              <Col sm={4}>
                <ListGroup.Item action eventKey="explanation">
                  {t('history.explanationtab')}
                </ListGroup.Item>
                {tabs}
              </Col>

              <Col sm={8}>
                <Tab.Content>
                  <Tab.Pane eventKey="explanation">
                    {t('history.explanationcontent')}
                  </Tab.Pane>
                  {cols}
                </Tab.Content>
              </Col>
            </Row>
          </Table>
        </Tab.Container>

      </div>
    </div>
  )
}

export default withRouter(withTranslation()(History));