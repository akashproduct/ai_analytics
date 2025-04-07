import React, { useState } from 'react';
import { 
  ChakraProvider, 
  Box, 
  Input, 
  Button, 
  VStack, 
  Heading, 
  Text,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
      const pieData = {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(199, 199, 199, 0.7)',
              'rgba(83, 102, 255, 0.7)',
              'rgba(40, 159, 64, 0.7)',
              'rgba(210, 199, 199, 0.7)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)',
              'rgba(40, 159, 64, 1)',
              'rgba(210, 199, 199, 1)',
            ],
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
                      labels: {
                        color: 'white',
                      }
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
            label: data.title,
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
                  scales: {
                    y: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'white',
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
                    {row.map((cell, cellIndex) => (
                      <Td key={cellIndex}>{cell === null || cell === undefined || String(cell) === "NaN" ? "-" : cell}</Td>
                    ))}
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
      // Use the sample data for testing without making API calls
      setTimeout(() => {
        setVisualizations(sampleData.result);
        setLoading(false);
      }, 500); // Simulate network delay
      return;
    }
  
    try {
      // const response = await axios.post('https://labx-query.vercel.app/query', { query });
      // const response = await axios.post('http://localhost:5000/query', { query });
      const response = await axios.post('https://2da4-2409-40d1-a-3af9-f172-4049-6c21-e7b9.ngrok-free.app/query', { query });

      console.log("Full Response:", response);
  
      // Ensure response.data is a JSON object
      let data = response.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          console.error("Error parsing response JSON:", parseError);
          throw new Error("Invalid JSON response from server.");
        }
      }
  
      console.log("Parsed Response Data:", data);
      console.log("Result:", data?.result);
  
      // Directly use the result array from the response
      if (data && Array.isArray(data.result)) {
        console.log("herhehehehe");
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
      setVisualizations([
        {
          type: "text",
          content: `Error processing your query: ${error.message}. Please try again.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ChakraProvider>
      <Box 
        minH="100vh" 
        bg="gray.900" 
        color="white" 
        p={5}
      >
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" color="purple.400">
            Lab Analytics Query Interface
          </Heading>
          
          <Card bg="gray.800" borderRadius="md">
            <CardBody>
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
            </CardBody>
          </Card>

          {loading && <Spinner size="xl" color="purple.400" alignSelf="center" />}

          {visualizations && !loading && (
            <VStack spacing={4} align="stretch">
              {visualizations.map((visualization, index) => (
                <Visualization key={index} data={visualization} />
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;