import { Routes } from "@angular/router";
import { TagDetailComponent } from "app/modules/tags/tag-detail.component";
import { TagsComponent } from "app/modules/tags/tags.component";

export default [
	{
		path: "",
		component: TagsComponent,
	},
	{
		path: ":tagId",
		component: TagDetailComponent,
	},
] as Routes;
