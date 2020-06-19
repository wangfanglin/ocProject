<!-- 管理员首页 -->
<template>
	<!-- 容器 -->
	<div class="admin-index-container">
		<div class="admin-index-main">
			<p>
				<span class="admin-index-tag">欢迎</span>
				欢迎您，系统管理员!
			</p>
			<div class="admin-index-rect">
				<router-link class="link-title" to="/pa/pa-role">建角色</router-link>
			</div>
			<div class="admin-index-rect">
				<router-link class="link-title" to="/pa/pa-org">建机构</router-link>
			</div>
			<div class="admin-index-rect left-model">
				<router-link class="link-title" to="/pa/pa-user">建用户</router-link>
			</div>
			<div class="admin-index-rect right-model">
				<router-link class="link-title" to="/pa/pa-param">系统参数</router-link>
			</div>
		</div>
	</div>
</template>
<script>
export default {};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.admin-index-container {
	width: 100%;
	text-align: center;
	.admin-index-main {
		margin-top: 100px;
		height: 600px;
	}
	p {
		// margin-top: 10vh;
		text-align: center;
		font-size: 40px;
		padding-bottom: 20px;
		color: $--color-333333;
		.admin-index-tag {
			display: inline-block;
			width: 50px;
			height: 30px;
			position: relative;
			bottom: 20px;
			background-color: $--color-faad14;
			color: $--color-white;
			line-height: 30px;
			border-radius: 3px;
			&::before {
				content: '';
				position: absolute;
				left: 45px;
				top: 10px;
				width: 10px;
				height: 10px;
				background-color: $--color-faad14;
				transform: rotate(225deg);
			}
		}
	}
	.admin-index-rect {
		position: relative;
		width: 100px;
		height: 180px;
		margin: 5px auto;
		background-color: $--color-primary;
		&::before {
			content: '';
			display: block;
			position: absolute;
			width: 0;
			height: 0;
			right: 100px;
			border-width: 90px 50px;
			border-style: solid;
			border-color: transparent $--color-primary transparent transparent;
		}
		&:after {
			content: '';
			display: block;
			position: absolute;
			width: 0;
			height: 0;
			left: 100px;
			top: 0;
			border-width: 90px 50px;
			border-style: solid;
			border-color: transparent transparent transparent $--color-primary;
		}
		.link-title {
			width: 150px;
			height: 30px;
			color: $--color-white;
			text-decoration: none;
			font-size: 38px;
			position: absolute;
			top: 79px;
			right: -26px;
			z-index: 100;
		}
	}
	.left-model,
	.right-model {
		bottom: 277px;
		right: 155px;
	}
	.right-model {
		left: 155px;
		bottom: 462px;
		.link-title {
			width: 160px;
			right: -32px;
		}
	}
}
</style>
