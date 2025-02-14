import styled from '@emotion/styled';

const HeroSection = styled.section`
  height: 100vh;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  padding: 0 2rem;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background-color: #e67e22;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #d35400;
  }
`;

const Hero = () => {
  return (
    <HeroSection>
      <HeroContent>
        <Title>El Yapımı Lüks Mumlar</Title>
        <Subtitle>
          Doğal malzemelerle üretilen, evinize huzur ve şıklık katan özel tasarım mumlarımızı keşfedin.
        </Subtitle>
        <Button>Ürünleri Keşfet</Button>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero; 