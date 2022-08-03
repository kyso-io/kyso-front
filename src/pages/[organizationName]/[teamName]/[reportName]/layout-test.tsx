import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';

const Index = () => {
  return (
    <div className="grow flex md:space-x-2 md:space-y-0 space-y-2">
      <div className="md:w-[450px] sm:w-full bg-indigo-100 rounded h-24"></div>
      <div className="md:w-screen-sm sm:w-full bg-indigo-200 rounded h-24"></div>
      <div className="md:w-full md:max-w-[1100px] sm:w-full bg-indigo-200 rounded  h-24"></div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
