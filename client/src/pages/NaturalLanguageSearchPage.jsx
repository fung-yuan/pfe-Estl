import NaturalLanguageSearch from "@/components/search/NaturalLanguageSearch";

const NaturalLanguageSearchPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Absence Search</h1>
      <NaturalLanguageSearch />
    </div>
  );
};

export default NaturalLanguageSearchPage;
