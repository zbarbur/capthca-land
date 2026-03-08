import { getSliderContent } from "../lib/content";
import { DualitySlider } from "./components/DualitySlider";

export default async function Home() {
	const content = await getSliderContent();
	return <DualitySlider content={content} />;
}
