import React, { useState } from 'react';
import { Layout, Input, Button, Space, Card, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import axios from 'axios';

const { Header, Content } = Layout;
const { TextArea } = Input;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #001529;
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

const StyledContent = styled(Content)`
  padding: 24px;
  background: #002140;
`;

const QueryCard = styled(Card)`
  margin-bottom: 24px;
  background: #001529;
  .ant-card-body {
    padding: 24px;
  }
`;

const ResultsContainer = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

interface ChartData {
  type: string;
  title: string;
  labels: string[];
  values: number[];
  content?: string;
}

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChartData[]>([]);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/query', { query });
      setResults(response.data.result);
    } catch (error) {
      console.error('Error querying data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledLayout>
      <StyledHeader>LabX Query Analytics</StyledHeader>
      <StyledContent>
        <QueryCard>
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query here..."
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleQuery}
              loading={loading}
              style={{ alignSelf: 'flex-end' }}
            >
              Query
            </Button>
          </Space>
        </QueryCard>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <ResultsContainer>
            {results.map((result, index) => (
              <Card
                key={index}
                title={result.title}
                style={{ background: '#001529' }}
              >
                {result.type === 'text' && <p>{result.content}</p>}
                {/* We'll add chart components here later */}
              </Card>
            ))}
          </ResultsContainer>
        )}
      </StyledContent>
    </StyledLayout>
  );
};

export default App; 