import Footer from './Footer';
import IntroduceApp from './IntroduceApp';
import IntroduceDivideConquer from './IntroduceDivideConquer';
import SignInScreen from './SignInScreen';

const EntryPage: React.FC = () => {
  return (
    <div>
      <IntroduceApp />
      <SignInScreen />
      <IntroduceDivideConquer videoSrc="../../public/introduceDivideConquer.mp4" />
      <Footer />
    </div>
  );
};

export default EntryPage;
