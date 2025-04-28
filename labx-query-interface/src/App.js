import React, { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie, Bar } from 'react-chartjs-2';
import {
  ChakraProvider,
  Container,
  Input,
  Button,
  VStack,
  Text,
  Box,
  Spinner,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  Heading,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const safetyColorMap = {
  'Safe': '#2ECC71',  // Green
  'Unsafe': '#E74C3C', // Red
  'Sub-Standard': '#F39C12', // Orange
  'Mis-Labelled': '#95A5A6', // Grey
  'Compliant as per FSSR': '#2ECC71', // Green
};

// Default colors for non-safety charts
const defaultColors = [
  'rgba(54, 162, 235, 0.7)',   // Blue
  'rgba(255, 99, 132, 0.7)',   // Pink
  'rgba(255, 206, 86, 0.7)',   // Yellow
  'rgba(75, 192, 192, 0.7)',   // Teal
  'rgba(153, 102, 255, 0.7)',  // Purple
  'rgba(255, 159, 64, 0.7)',   // Orange
  'rgba(199, 199, 199, 0.7)',  // Grey
  'rgba(83, 102, 255, 0.7)',   // Blue-Purple
  'rgba(40, 159, 64, 0.7)',    // Green
  'rgba(210, 199, 199, 0.7)',  // Light Grey
];

const defaultBorderColors = defaultColors.map(color => color.replace('0.7', '1'));

// Component to render different visualization types
const Visualization = ({ data }) => {
  const { type } = data;

  switch (type) {
    case 'text':
      return (
        <Card bg="gray.800" borderRadius="md" color="white" mb={4}>
          <CardBody>
            <Text>{data.content}</Text>
          </CardBody>
        </Card>
      );
      
    case 'pie':
      // Check if this is a safety/compliance chart
      const isSafetyChart = data.labels.some(label => safetyColorMap[label]);
      
      const backgroundColor = isSafetyChart
        ? data.labels.map(label => safetyColorMap[label] || defaultColors[0])
        : defaultColors.slice(0, data.labels.length);
        
      const borderColor = isSafetyChart
        ? backgroundColor
        : defaultBorderColors.slice(0, data.labels.length);

      const pieData = {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor,
            borderColor,
            borderWidth: 1,
          },
        ],
      };
      
      return (
        <Card bg="gray.800" borderRadius="md" color="white" mb={4}>
          <CardHeader>
            <Heading size="md" color="purple.300">{data.title}</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px" position="relative">
              <Pie 
                data={pieData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: 'white',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    },
                    datalabels: {
                      display: true,
                      color: 'white',
                      font: {
                        weight: 'bold',
                        size: 11
                      },
                      formatter: (value, ctx) => {
                        const dataset = ctx.chart.data.datasets[0];
                        const total = dataset.data.reduce((acc, data) => acc + data, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                      },
                      anchor: 'end',
                      align: 'start',
                      offset: 8
                    }
                  }
                }} 
              />
            </Box>
          </CardBody>
        </Card>
      );
      
    case 'bar':
      const barData = {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      };
      
      return (
        <Card bg="gray.800" borderRadius="md" color="white" mb={4}>
          <CardHeader>
            <Heading size="md" color="purple.300">{data.title}</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px" position="relative">
              <Bar 
                data={barData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    datalabels: {
                      display: true,
                      color: 'white',
                      anchor: 'end',
                      align: 'top',
                      offset: 4,
                      font: {
                        weight: 'bold'
                      },
                      formatter: (value) => value
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'white'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: 'white'
                      }
                    }
                  }
                }} 
              />
            </Box>
          </CardBody>
        </Card>
      );
      
    case 'table':
      return (
        <Card bg="gray.800" borderRadius="md" color="white" mb={4}>
          <CardHeader>
            <Heading size="md" color="purple.300">{data.title}</Heading>
          </CardHeader>
          <CardBody overflowX="auto">
            <Table variant="simple" colorScheme="purple">
              <Thead>
                <Tr>
                  {data.headers.map((header, index) => (
                    <Th key={index} color="white">{header}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {data.rows.map((row, rowIndex) => (
                  <Tr key={rowIndex}>
                    {Array.isArray(row) ? (
                      // If row is an array, render directly
                      row.map((cell, cellIndex) => (
                        <Td key={cellIndex}>
                          {cell === null || cell === undefined || String(cell) === "NaN" ? "-" : cell}
                        </Td>
                      ))
                    ) : (
                      // If row is an object, map through headers to get values
                      data.headers.map((header, cellIndex) => (
                        <Td key={cellIndex}>
                          {row[header] === null || row[header] === undefined || String(row[header]) === "NaN" ? "-" : row[header]}
                        </Td>
                      ))
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      );
      
    default:
      return <Text>Unknown visualization type: {type}</Text>;
  }
};

function App() {
  const [query, setQuery] = useState('');
  const [visualizations, setVisualizations] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // For development/testing - initialize with the provided sample data
  const [useSampleData, setUseSampleData] = useState(false);
  
  const sampleData = {
    "result": [
      {
        "content": "There are 17 pending lab tests in Punjab.",
        "type": "text"
      },
      {
        "labels": [
          "Turmeric",
          "Coriander",
          "Black Pepper",
          "Red Chili",
          "Cumin"
        ],
        "title": "Distribution of Pending Test Types in Punjab",
        "type": "pie",
        "values": [
          6,
          4,
          3,
          2,
          2
        ]
      },
      {
        "headers": [
          "Sample ID",
          "Region",
          "Test Type",
          "Status",
          "Test Date",
          "Rejection Reason"
        ],
        "rows": [
          [
            "SAMPLE-1",
            "Punjab",
            "Coriander",
            "Pending",
            "2025-03-17",
            null
          ],
          [
            "SAMPLE-4",
            "Punjab",
            "Black Pepper",
            "Pending",
            "2025-01-29",
            null
          ],
          [
            "SAMPLE-7",
            "Punjab",
            "Turmeric",
            "Pending",
            "2025-03-18",
            null
          ],
          [
            "SAMPLE-13",
            "Punjab",
            "Red Chili",
            "Pending",
            "2025-03-17",
            null
          ],
          [
            "SAMPLE-29",
            "Punjab",
            "Cumin",
            "Pending",
            "2025-01-07",
            null
          ],
          [
            "SAMPLE-36",
            "Punjab",
            "Turmeric",
            "Pending",
            "2025-01-14",
            null
          ],
          [
            "SAMPLE-40",
            "Punjab",
            "Turmeric",
            "Pending",
            "2025-02-05",
            null
          ],
          [
            "SAMPLE-66",
            "Punjab",
            "Black Pepper",
            "Pending",
            "2025-03-18",
            null
          ],
          [
            "SAMPLE-71",
            "Punjab",
            "Turmeric",
            "Pending",
            "2025-03-25",
            null
          ],
          [
            "SAMPLE-83",
            "Punjab",
            "Turmeric",
            "Pending",
            "2025-02-21",
            null
          ],
          [
            "SAMPLE-85",
            "Punjab",
            "Cumin",
            "Pending",
            "2025-03-02",
            null
          ],
          [
            "SAMPLE-133",
            "Punjab",
            "Turmeric",
            "Pending",
            "2025-03-31",
            null
          ],
          [
            "SAMPLE-146",
            "Punjab",
            "Coriander",
            "Pending",
            "2025-03-10",
            null
          ],
          [
            "SAMPLE-149",
            "Punjab",
            "Coriander",
            "Pending",
            "2025-03-18",
            null
          ],
          [
            "SAMPLE-162",
            "Punjab",
            "Black Pepper",
            "Pending",
            "2025-03-18",
            null
          ],
          [
            "SAMPLE-164",
            "Punjab",
            "Red Chili",
            "Pending",
            "2025-02-01",
            null
          ],
          [
            "SAMPLE-171",
            "Punjab",
            "Coriander",
            "Pending",
            "2025-01-24",
            null
          ]
        ],
        "title": "Pending Lab Tests in Punjab",
        "type": "table"
      }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() && !useSampleData) return;
  
    setLoading(true);
  
    if (useSampleData) {
      setTimeout(() => {
        setVisualizations(sampleData.result);
        setLoading(false);
      }, 500);
      return;
    }
  
    try {
      const response = await axios.post('https://ai-analytics-x6m3.onrender.com/query', 
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      console.log("Full Response:", response);
  
      let data = response.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          console.error("Error parsing response JSON:", parseError);
          throw new Error("Invalid JSON response from server.");
        }
      }
  
      if (data && Array.isArray(data.result)) {
        setVisualizations(data.result);
      } else {
        console.error('Unexpected response structure:', data);
        setVisualizations([
          {
            type: "text",
            content: "Received unexpected data structure from server."
          }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = "An error occurred while processing your query.";
      
      if (error.response) {
        // Server responded with an error
        errorMessage = `Server error: ${error.response.data.message || error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Could not connect to the server. Please ensure the backend server is running.";
      } else {
        // Error in request setup
        errorMessage = error.message;
      }
      
      setVisualizations([
        {
          type: "text",
          content: errorMessage
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    window.open('http://localhost:5001/download', '_blank');
  };

  return (
    <ChakraProvider>
      <Box 
        minH="100vh" 
        bg="gray.900" 
        color="white" 
        p={5}
      >
        <Container maxW="container.xl" py={5}>
          <VStack spacing={5} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
              LabX Query Interface
            </Text>
            
            <Flex justifyContent="space-between" alignItems="center">
              <Button colorScheme="teal" onClick={handleDownload}>
                Download Dataset
              </Button>
            </Flex>

            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection={["column", "row"]} gap={2}>
                <Input
                  placeholder="Enter your query (e.g., Show pending lab tests in Punjab)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size="lg"
                  bg="gray.700"
                  border="none"
                  color="white"
                />
                <Button 
                  type="submit" 
                  colorScheme="purple" 
                  size="lg"
                  leftIcon={<SearchIcon />}
                  isLoading={loading}
                  minW={["full", "150px"]}
                >
                  Query
                </Button>
              </Box>
              
              {/* For testing/development purposes */}
              <Box mt={2} display="flex" alignItems="center">
                <Button
                  size="sm"
                  colorScheme={useSampleData ? "green" : "gray"}
                  variant="outline"
                  onClick={() => {
                    setUseSampleData(!useSampleData);
                    if (!useSampleData) {
                      setQuery("Show pending lab tests in Punjab");
                    }
                  }}
                  mr={2}
                >
                  {useSampleData ? "Using Sample Data" : "Use Sample Data"}
                </Button>
                <Text fontSize="sm" color="gray.400">
                  {useSampleData ? "Click to disable sample data mode" : "Enable for testing without backend"}
                </Text>
              </Box>
            </form>

            {loading && <Spinner size="xl" color="purple.400" alignSelf="center" />}

            {visualizations && !loading && (
              <VStack spacing={4} align="stretch">
                {visualizations.map((visualization, index) => (
                  <Visualization key={index} data={visualization} />
                ))}
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;